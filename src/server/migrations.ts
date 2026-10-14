import { createHash } from "node:crypto";
import { readFile, readdir } from "node:fs/promises";
import { resolve } from "node:path";
import type { Database } from "./database";
export interface Migration { version: number; name: string; checksum: string; sql: string; }
export interface MigrationReport { applied: number[]; adoptedLegacy: boolean; currentVersion: number; }
const LOCK_KEY = 1212503622;
export async function loadMigrations(directory = resolve("database/migrations")): Promise<Migration[]> {
  const files = (await readdir(/* turbopackIgnore: true */ directory)).filter(name => name.endsWith(".sql")).sort();
  const migrations = await Promise.all(files.map(async name => {
    const match = /^(\d{3})-([a-z0-9-]+)\.sql$/.exec(name);
    if (!match) throw new Error(`Invalid migration filename: ${name}`);
    const sql = (await readFile(/* turbopackIgnore: true */ resolve(directory, name), "utf8")).replace(/^\uFEFF/, "").replace(/\r\n/g, "\n");
    if (!sql.trim()) throw new Error(`Empty migration: ${name}`);
    return { version: Number(match[1]), name, sql, checksum: createHash("sha256").update(sql).digest("hex") };
  }));
  if (!migrations.length || migrations.some((migration, index) => migration.version !== index + 1)) throw new Error("Migrations must be consecutively numbered from 001");
  return migrations;
}
const legacyColumns: Record<string, string[]> = {
  posts: ["id", "slug", "title", "excerpt", "body", "author", "category", "tags", "cover_image", "cover_alt", "status", "published_at", "seo_title", "seo_description", "canonical_url", "noindex", "version", "created_at", "updated_at"],
  post_revisions: ["id", "post_id", "version", "snapshot", "created_at"],
  slug_redirects: ["slug", "post_id"], rate_limits: ["key", "count", "expires_at"],
  inquiries: ["id", "name", "email", "phone", "message", "property_id", "consent_at", "created_at"],
};
async function columns(db: Database, table: string): Promise<string[]> {
  return db.dialect === "postgres"
    ? (await db.query("SELECT column_name FROM information_schema.columns WHERE table_schema=current_schema() AND table_name=?", [table])).map(row => String(row.column_name))
    : (await db.query(`PRAGMA table_info(${table})`)).map(row => String(row.name));
}
async function validateLegacy(db: Database) {
  for (const [table, expected] of Object.entries(legacyColumns)) {
    const actual = await columns(db, table);
    if (actual.length !== expected.length || expected.some(name => !actual.includes(name))) throw new Error(`Legacy migration 1 does not match the expected ${table} columns; restore/reconcile before migrating`);
  }
}
export async function migrateDatabase(db: Database, definitions?: Migration[]): Promise<MigrationReport> {
  const migrations = definitions ?? await loadMigrations();
  if (!migrations.length || migrations.some((item, index) => item.version !== index + 1 || !item.name || createHash("sha256").update(item.sql).digest("hex") !== item.checksum)) throw new Error("Invalid migration definitions");
  return db.transaction(async tx => {
    if (tx.dialect === "postgres") {
      const [lock] = await tx.query("SELECT pg_try_advisory_xact_lock(?) AS acquired", [LOCK_KEY]);
      if (!lock.acquired) throw new Error("Another migration is running; retry after it finishes");
      await tx.script("SET LOCAL lock_timeout = '5s'; SET LOCAL statement_timeout = '60s';");
    }
    await tx.script("CREATE TABLE IF NOT EXISTS schema_migrations (version INTEGER PRIMARY KEY, name TEXT, checksum TEXT, applied_at TEXT NOT NULL);");
    const ledgerColumns = await columns(tx, "schema_migrations");
    for (const column of ["name", "checksum"]) if (!ledgerColumns.includes(column)) await tx.script(`ALTER TABLE schema_migrations ADD COLUMN ${column} TEXT;`);
    const ledger = await tx.query("SELECT version,name,checksum FROM schema_migrations ORDER BY version");
    if (ledger.some((row, index) => Number(row.version) !== index + 1 || Number(row.version) > migrations.length)) throw new Error("Migration history has a gap or a newer version than this application");
    if (!ledger.length) for (const table of Object.keys(legacyColumns)) if ((await columns(tx, table)).length) throw new Error("An untracked application schema exists; reconcile its migration history before proceeding");
    let adoptedLegacy = false;
    for (const row of ledger) {
      const definition = migrations[Number(row.version) - 1];
      if (Number(row.version) === 1 && row.name == null && row.checksum == null) {
        if (ledger.length !== 1) throw new Error("Only the known version-1 schema can be adopted");
        await validateLegacy(tx);
        await tx.execute("UPDATE schema_migrations SET name=?,checksum=? WHERE version=?", [definition.name, definition.checksum, 1]);
        adoptedLegacy = true;
      } else if (row.name !== definition.name || row.checksum !== definition.checksum) throw new Error(`Applied migration ${row.version} was changed; restore its original file`);
    }
    const applied: number[] = [];
    for (const migration of migrations.slice(ledger.length)) {
      await tx.script(migration.sql);
      await tx.execute("INSERT INTO schema_migrations(version,name,checksum,applied_at) VALUES(?,?,?,?)", [migration.version, migration.name, migration.checksum, new Date().toISOString()]);
      applied.push(migration.version);
    }
    return { applied, adoptedLegacy, currentVersion: migrations.at(-1)!.version };
  });
}
