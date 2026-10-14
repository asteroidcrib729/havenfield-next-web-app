import { afterEach, describe, expect, it } from "vitest";
import { randomUUID } from "node:crypto";
import { Pool } from "pg";
import { createDatabase, type Database } from "../../src/server/database";
import { loadMigrations, migrateDatabase } from "../../src/server/migrations";
import { failedMigration, freshAndIncremental, legacyUpgrade } from "../migration-contract";
import { rejectsBrokenBackup, roundTrip } from "../backup-contract";
let admin: Pool | undefined; const schemas:string[]=[]; const handles: Database[] = [];
async function database() {
  const value = process.env.HAVENFIELD_TEST_DATABASE_URL;
  if (!value) throw new Error("Use npm run test:postgres to create an isolated database");
  const url = new URL(value);
  if (!["localhost", "127.0.0.1", "[::1]"].includes(url.hostname) || !/^\/havenfield_test_[a-z0-9_]+$/.test(url.pathname)) throw new Error("Unsafe test database");
  admin ??= new Pool({ connectionString: url.toString() }); const schema = `test_${randomUUID().replaceAll("-", "")}`;schemas.push(schema);
  await admin.query(`CREATE SCHEMA ${schema}`);
  url.searchParams.set("options", `-c search_path=${schema}`);
  const db = await createDatabase({ url: url.toString() }); handles.push(db); return { db, url: url.toString() };
}
afterEach(async () => { for (const db of handles.splice(0)) await db.close(); for(const schema of schemas.splice(0))await admin?.query(`DROP SCHEMA ${schema} CASCADE`); await admin?.end(); admin = undefined; });
describe("real PostgreSQL persistence", () => {
  it("installs, repeats, upgrades and refuses altered/newer history", async () => freshAndIncremental((await database()).db));
  it("rolls back a failed migration including its DDL", async () => failedMigration((await database()).db));
  it("preserves version-1 article, revision and redirect data during adoption", async () => legacyUpgrade((await database()).db));
  it("rejects simultaneous migrations on independent connections", async () => {
    const { db, url } = await database(); const other = await createDatabase({ url }); handles.push(other);
    let release!: () => void; let locked!: () => void;
    const wait = new Promise<void>(resolve => release = resolve); const acquired = new Promise<void>(resolve => locked = resolve);
    const owner = db.transaction(async tx => { await tx.query("SELECT pg_advisory_xact_lock(?)", [1212503622]); locked(); await wait; });
    await acquired;
    try { await expect(migrateDatabase(other)).rejects.toThrow("Another migration is running"); } finally { release(); await owner; }
    expect((await migrateDatabase(other)).applied).toEqual([1,2]);
  });
  it("uses separate backend connections and safely binds literal question marks", async () => {
    const { db, url } = await database(); const other = await createDatabase({ url }); handles.push(other);
    expect((await db.query("SELECT pg_backend_pid() AS pid"))[0].pid).not.toBe((await other.query("SELECT pg_backend_pid() AS pid"))[0].pid);
    expect((await db.query("SELECT '?' AS literal, ?::text AS bound", ["value"]))[0]).toEqual({ literal: "?", bound: "value" });
    expect(await loadMigrations()).toHaveLength(2);
  });
  it("restores application data into an empty PostgreSQL schema",async()=>{await roundTrip((await database()).db,(await database()).db);});
  it("refuses corruption and rolls back a broken restore",async()=>{await rejectsBrokenBackup((await database()).db,(await database()).db);});
});
