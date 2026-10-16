import { afterEach, describe, expect, it } from "vitest";
import { mkdir, mkdtemp, rm } from "node:fs/promises";
import { resolve, relative, isAbsolute } from "node:path";
import { createDatabase, postgresSql, type Database } from "../src/server/database";
import { migrateDatabase } from "../src/server/migrations";
import { failedMigration, freshAndIncremental, legacyUpgrade } from "./migration-contract";
import { rejectsBrokenBackup, roundTrip } from "./backup-contract";
let directory: string | undefined;
let db: Database | undefined;
async function database() {
  await mkdir(".data", { recursive: true });
  directory = await mkdtemp(resolve(".data/migration-test-"));
  db = await createDatabase({
    url: "",
    sqlitePath: resolve(directory, "test.sqlite"),
    autoMigrate: false,
  });
  return db;
}
afterEach(async () => {
  await db?.close();
  db = undefined;
  if (directory) {
    const path = relative(resolve(".data"), directory);
    if (isAbsolute(path) || !path.startsWith("migration-test-"))
      throw new Error("Unsafe test cleanup");
    await rm(directory, { recursive: true, force: true, maxRetries: 5 });
    directory = undefined;
  }
});
describe("versioned SQLite migrations", () => {
  it("installs, repeats, upgrades and refuses altered/newer history", async () =>
    freshAndIncremental(await database()));
  it("rolls back an entire failed incremental migration", async () =>
    failedMigration(await database()));
  it("adopts the original version-1 schema without changing stored content", async () =>
    legacyUpgrade(await database()));
  it("refuses an incompatible legacy schema", async () => {
    const db = await database();
    await db.script(
      "CREATE TABLE schema_migrations(version INTEGER PRIMARY KEY,applied_at TEXT); INSERT INTO schema_migrations VALUES(1,'previous');",
    );
    await expect(migrateDatabase(db)).rejects.toThrow("expected posts columns");
  });
  it("binds parameters without changing quoted SQL and comments", () =>
    expect(
      postgresSql("SELECT '?' AS literal, ? AS value, $$?$$ AS body -- ?\n/* ? */ WHERE x=?"),
    ).toBe("SELECT '?' AS literal, $1 AS value, $$?$$ AS body -- ?\n/* ? */ WHERE x=$2"));
  it("restores articles, revisions, redirects and inquiries into an empty database", async () => {
    const source = await database();
    const target = await createDatabase({
      url: "",
      sqlitePath: resolve(directory!, "restored.sqlite"),
      autoMigrate: false,
    });
    try {
      await roundTrip(source, target);
    } finally {
      await target.close();
    }
  });
  it("refuses tampered backups and rolls back failed restores", async () => {
    const source = await database();
    const target = await createDatabase({
      url: "",
      sqlitePath: resolve(directory!, "rejected.sqlite"),
      autoMigrate: false,
    });
    try {
      await rejectsBrokenBackup(source, target);
    } finally {
      await target.close();
    }
  });
});
