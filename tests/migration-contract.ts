import { readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { expect } from "vitest";
import type { Database } from "../src/server/database";
import { loadMigrations, migrateDatabase, type Migration } from "../src/server/migrations";
export function definition(version: number, sql: string): Migration {
  return {
    version,
    name: `${String(version).padStart(3, "0")}-test.sql`,
    sql,
    checksum: createHash("sha256").update(sql).digest("hex"),
  };
}
export async function freshAndIncremental(db: Database) {
  const initial = await loadMigrations();
  expect((await migrateDatabase(db)).applied).toEqual(initial.map((item) => item.version));
  expect((await migrateDatabase(db)).applied).toEqual([]);
  const added = definition(
    initial.length + 1,
    "CREATE TABLE migration_probe (id TEXT PRIMARY KEY, value TEXT NOT NULL); INSERT INTO migration_probe(id,value) VALUES('probe','a; literal ? value');",
  );
  expect((await migrateDatabase(db, [...initial, added])).applied).toEqual([initial.length + 1]);
  expect((await db.query("SELECT value FROM migration_probe"))[0].value).toBe("a; literal ? value");
  await expect(migrateDatabase(db, initial)).rejects.toThrow("newer version");
  const changed = definition(initial.length + 1, added.sql + "\n-- changed");
  await expect(migrateDatabase(db, [...initial, changed])).rejects.toThrow("was changed");
}
export async function failedMigration(db: Database) {
  const initial = await loadMigrations();
  await migrateDatabase(db);
  await expect(
    migrateDatabase(db, [
      ...initial,
      definition(
        initial.length + 1,
        "CREATE TABLE migration_failure (id INTEGER); INSERT INTO missing_table(id) VALUES(1);",
      ),
    ]),
  ).rejects.toThrow();
  expect(await db.query("SELECT version FROM schema_migrations")).toHaveLength(initial.length);
  await expect(db.query("SELECT * FROM migration_failure")).rejects.toThrow();
}
export async function legacyUpgrade(db: Database) {
  await db.script(await readFile("database/schema.sql", "utf8"));
  await db.execute("INSERT INTO schema_migrations(version,applied_at) VALUES(?,?)", [
    1,
    "2026-10-01T00:00:00.000Z",
  ]);
  await db.execute(
    "INSERT INTO posts(id,slug,title,excerpt,body,author,category,tags,cover_image,cover_alt,status,published_at,seo_title,seo_description,canonical_url,noindex,version,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
    [
      "legacy",
      "legacy-story",
      "Preserved article",
      "Preserved introduction",
      "A preserved article with enough original content.",
      "Havenfield",
      "Design",
      '["Light"]',
      "/media/interior.jpg",
      "A warm room",
      "published",
      "2026-10-01T00:00:00.000Z",
      "",
      "",
      "",
      0,
      1,
      "2026-10-01T00:00:00.000Z",
      "2026-10-01T00:00:00.000Z",
    ],
  );
  await db.execute(
    "INSERT INTO post_revisions(id,post_id,version,snapshot,created_at) VALUES(?,?,?,?,?)",
    ["revision", "legacy", 1, '{"title":"Preserved article"}', "2026-10-01T00:00:00.000Z"],
  );
  await db.execute("INSERT INTO slug_redirects(slug,post_id) VALUES(?,?)", ["old-story", "legacy"]);
  const before = await db.query("SELECT * FROM posts");
  const report = await migrateDatabase(db);
  expect(report.adoptedLegacy).toBe(true);
  expect(report.applied).toEqual([2, 3, 4]);
  expect(await db.query("SELECT * FROM posts")).toEqual(before);
  expect(await db.query("SELECT * FROM post_revisions")).toHaveLength(1);
  expect(await db.query("SELECT * FROM slug_redirects")).toHaveLength(1);
  expect((await db.query("SELECT checksum FROM schema_migrations"))[0].checksum).toMatch(
    /^[a-f0-9]{64}$/,
  );
  expect((await migrateDatabase(db)).adoptedLegacy).toBe(false);
}
