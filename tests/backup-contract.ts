import { createHash } from "node:crypto";
import { expect } from "vitest";
import type { Database } from "../src/server/database";
import { exportDatabase, restoreDatabase } from "../src/server/backup";
import { legacyUpgrade } from "./migration-contract";
export async function roundTrip(source: Database, target: Database) {
  await legacyUpgrade(source);
  await source.execute("INSERT INTO inquiries(id,name,email,phone,message,property_id,consent_at,created_at) VALUES(?,?,?,?,?,?,?,?)", ["inquiry", "Example Visitor", "visitor@example.test", "", "A synthetic inquiry for a fictional property", "", "2026-10-01T00:00:00.000Z", "2026-10-01T00:00:00.000Z"]);
  const backup = await exportDatabase(source);
  await restoreDatabase(target, backup);
  expect((await exportDatabase(target)).payload.tables).toEqual(backup.payload.tables);
  await expect(restoreDatabase(target, backup)).rejects.toThrow("nonempty");
  return backup;
}
export async function rejectsBrokenBackup(source: Database, target: Database) {
  await legacyUpgrade(source); const backup = await exportDatabase(source);
  const corrupt = structuredClone(backup); corrupt.payload.tables.posts[0].title = "Changed without updating checksum";
  await expect(restoreDatabase(target, corrupt)).rejects.toThrow("checksum");
  const invalid = structuredClone(backup); invalid.payload.tables.post_revisions[0].post_id = "missing";
  invalid.checksum = createHash("sha256").update(JSON.stringify(invalid.payload)).digest("hex");
  await expect(restoreDatabase(target, invalid)).rejects.toThrow();
  expect(await target.query("SELECT * FROM posts")).toHaveLength(0);
  expect(await target.query("SELECT * FROM post_revisions")).toHaveLength(0);
}
