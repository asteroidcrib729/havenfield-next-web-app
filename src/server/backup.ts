import { createHash } from "node:crypto";
import type { Database } from "./database";
import { migrateDatabase } from "./migrations";
const tables = {
  posts: [
    "id",
    "slug",
    "title",
    "excerpt",
    "body",
    "author",
    "category",
    "tags",
    "cover_image",
    "cover_alt",
    "status",
    "published_at",
    "seo_title",
    "seo_description",
    "canonical_url",
    "noindex",
    "version",
    "created_at",
    "updated_at",
  ],
  post_revisions: ["id", "post_id", "version", "snapshot", "created_at"],
  slug_redirects: ["slug", "post_id"],
  inquiries: [
    "id",
    "name",
    "email",
    "phone",
    "message",
    "property_id",
    "consent_at",
    "created_at",
    "status",
    "updated_at",
    "expires_at",
    "stage",
    "notes",
    "version",
  ],
  media: [
    "id",
    "object_key",
    "url",
    "storage",
    "width",
    "height",
    "bytes",
    "content_type",
    "alt",
    "owner",
    "created_at",
    "state",
    "collection",
    "focal_x",
    "focal_y",
    "version",
  ],
  media_references: ["media_id", "post_id", "kind"],
  properties: ["id", "slug", "status", "version", "content", "created_at", "updated_at"],
  property_revisions: ["id", "property_id", "version", "snapshot", "created_at"],
  property_media_references: ["media_id", "property_id", "kind"],
  catalog_state: ["id", "initialized"],
  publisher_actions: ["id", "actor", "action", "target", "created_at"],
  article_autosaves: [
    "key",
    "post_id",
    "actor",
    "base_version",
    "snapshot",
    "generation",
    "updated_at",
  ],
  inquiry_receipts: ["key", "fingerprint", "inquiry_id", "expires_at"],
} as const;
const newTables = [
  "properties",
  "property_revisions",
  "property_media_references",
  "catalog_state",
];
type Table = keyof typeof tables;
type Row = Record<string, string | number | null>;
interface Payload {
  format: 2 | 3 | 4;
  exportedAt: string;
  migrations: { version: number; name: string; checksum: string }[];
  tables: Record<Table, Row[]>;
}
export interface DatabaseBackup {
  payload: Payload;
  checksum: string;
}
const digest = (payload: unknown) =>
  createHash("sha256").update(JSON.stringify(payload)).digest("hex");
export function parseBackup(input: unknown): DatabaseBackup {
  const backup = input as DatabaseBackup;
  if (
    !backup ||
    !backup.payload ||
    ![1, 2, 3, 4].includes(backup.payload.format) ||
    backup.checksum !== digest(backup.payload) ||
    !Array.isArray(backup.payload.migrations) ||
    !backup.payload.migrations.length ||
    !backup.payload.tables
  )
    throw new Error("Invalid backup format or checksum");
  if (Number(backup.payload.format) === 1) {
    const old = structuredClone(backup);
    if (
      Object.keys(old.payload.tables).sort().join() !==
      ["posts", "post_revisions", "slug_redirects", "inquiries"].sort().join()
    )
      throw new Error("Invalid legacy backup inventory");
    for (const table of Object.keys(tables).filter(
      (table) => !newTables.includes(table),
    ) as Table[])
      old.payload.tables[table] ??= [];
    old.payload.tables.inquiries = old.payload.tables.inquiries.map((row) => ({
      ...row,
      status: "new",
      updated_at: row.created_at,
      expires_at: null,
    }));
    old.payload.format = 2;
    old.checksum = digest(old.payload);
    return parseBackup(old);
  }
  if (Number(backup.payload.format) === 2) {
    const old = structuredClone(backup);
    if (
      Object.keys(old.payload.tables).sort().join() !==
      Object.keys(tables)
        .filter((table) => !newTables.includes(table))
        .sort()
        .join()
    )
      throw new Error("Invalid format-2 backup inventory");
    for (const table of newTables) old.payload.tables[table as Table] = [];
    old.payload.tables.media = old.payload.tables.media.map((row) => ({
      ...row,
      collection: "",
      focal_x: 50,
      focal_y: 50,
      version: 1,
    }));
    old.payload.format = 3;
    old.checksum = digest(old.payload);
    return parseBackup(old);
  }
  if (Number(backup.payload.format) === 3) {
    const old = structuredClone(backup);
    if (!Array.isArray(old.payload.tables.inquiries))
      throw new Error("Invalid legacy inquiry rows");
    old.payload.tables.inquiries = old.payload.tables.inquiries.map((row) => ({
      ...row,
      stage: "new",
      notes: "",
      version: 1,
    }));
    old.payload.format = 4;
    old.checksum = digest(old.payload);
    return parseBackup(old);
  }
  if (Object.keys(backup.payload.tables).sort().join() !== Object.keys(tables).sort().join())
    throw new Error("Backup table inventory does not match this application");
  for (const [table, columns] of Object.entries(tables)) {
    const rows = backup.payload.tables[table as Table];
    if (!Array.isArray(rows)) throw new Error("Invalid backup rows");
    for (const row of rows) {
      if (
        !row ||
        Object.keys(row).sort().join() !== [...columns].sort().join() ||
        Object.values(row).some(
          (value) =>
            value !== null &&
            typeof value !== "string" &&
            (typeof value !== "number" || !Number.isFinite(value)),
        )
      )
        throw new Error(`Invalid ${table} backup row`);
    }
  }
  for (const [index, migration] of backup.payload.migrations.entries())
    if (
      migration.version !== index + 1 ||
      typeof migration.name !== "string" ||
      !/^[a-f0-9]{64}$/.test(migration.checksum)
    )
      throw new Error("Invalid backup migration history");
  return backup;
}
export async function exportDatabase(db: Database): Promise<DatabaseBackup> {
  return db.transaction(async (tx) => {
    if (tx.dialect === "postgres")
      await tx.script("SET TRANSACTION ISOLATION LEVEL REPEATABLE READ READ ONLY;");
    const migrations = await tx.query<{ version: number; name: string; checksum: string }>(
      "SELECT version,name,checksum FROM schema_migrations ORDER BY version",
    );
    const data = {} as Record<Table, Row[]>;
    for (const table of Object.keys(tables) as Table[])
      data[table] = await tx.query<Row>(
        `SELECT ${tables[table].join(",")} FROM ${table} ORDER BY ${table === "slug_redirects" ? "slug" : table === "property_media_references" ? "media_id,property_id,kind" : table === "media_references" ? "media_id,post_id,kind" : table === "article_autosaves" || table === "inquiry_receipts" ? "key" : "id"}`,
      );
    for (const row of data.inquiry_receipts) {
      const value = Number(row.expires_at);
      if (!Number.isSafeInteger(value))
        throw new Error("Receipt timestamp exceeds the safe backup range");
      row.expires_at = value;
    }
    const payload: Payload = {
      format: 4,
      exportedAt: new Date().toISOString(),
      migrations,
      tables: data,
    };
    return parseBackup({ payload, checksum: digest(payload) });
  });
}
export async function checkRestoreTarget(db: Database, input: unknown) {
  const backup = parseBackup(input);
  const existing = await db.query(
    db.dialect === "postgres"
      ? "SELECT table_name AS name FROM information_schema.tables WHERE table_schema=current_schema() AND table_type='BASE TABLE'"
      : "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'",
  );
  for (const row of existing) {
    const table = String(row.name);
    if (table === "schema_migrations") continue;
    if (table === "rate_limits") continue;
    if (table === "app_settings") {
      if (
        (await db.query("SELECT key FROM app_settings WHERE key<>'deployment_environment'")).length
      )
        throw new Error("Unknown target settings are refused");
      continue;
    }
    if (!Object.hasOwn(tables, table))
      throw new Error("Restore requires an empty application database without unknown tables");
    if (Number((await db.query(`SELECT COUNT(*) AS total FROM ${table}`))[0].total))
      throw new Error("Restore refuses to overwrite a nonempty database");
  }
  return backup;
}
export async function restoreDatabase(db: Database, input: unknown): Promise<void> {
  const backup = await checkRestoreTarget(db, input);
  await migrateDatabase(db);
  await db.transaction(async (tx) => {
    if (tx.dialect === "postgres")
      await tx.script(
        `SET LOCAL lock_timeout = '5s'; LOCK TABLE ${Object.keys(tables).join(",")} IN ACCESS EXCLUSIVE MODE;`,
      );
    const history = await tx.query(
      "SELECT version,name,checksum FROM schema_migrations ORDER BY version",
    );
    if (
      JSON.stringify(history.slice(0, backup.payload.migrations.length)) !==
        JSON.stringify(backup.payload.migrations) ||
      history.length < backup.payload.migrations.length
    )
      throw new Error("Backup schema version/checksums do not match this application");
    for (const table of Object.keys(tables) as Table[]) {
      if (Number((await tx.query(`SELECT COUNT(*) AS total FROM ${table}`))[0].total))
        throw new Error("Restore target changed; nonempty databases are refused");
      const columns = tables[table];
      for (const row of backup.payload.tables[table])
        await tx.execute(
          `INSERT INTO ${table}(${columns.join(",")}) VALUES(${columns.map(() => "?").join(",")})`,
          columns.map((column) => row[column]),
        );
    }
  });
}
