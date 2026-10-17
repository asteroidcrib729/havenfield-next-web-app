import { expect } from "vitest";
import type { Database } from "../src/server/database";
import { exportDatabase, restoreDatabase, parseBackup } from "../src/server/backup";
import { createHash } from "node:crypto";
export async function inquiryConversationContract(source: Database, target: Database) {
  const now = new Date().toISOString();
  await source.execute(
    "INSERT INTO inquiries(id,name,email,phone,message,property_id,consent_at,created_at) VALUES(?,?,?,?,?,?,?,?)",
    ["conversation", "Sample", "sample@example.test", "", "An invented conversation", "", now, now],
  );
  expect(
    (
      await source.query("SELECT stage,notes,version,status FROM inquiries WHERE id='conversation'")
    )[0],
  ).toMatchObject({ stage: "new", notes: "", version: 1, status: "new" });
  expect(
    await source.execute(
      "UPDATE inquiries SET stage=?,notes=?,version=version+1 WHERE id=? AND version=?",
      ["contacted", "Private invented note", "conversation", 1],
    ),
  ).toBe(1);
  expect(
    await source.execute(
      "UPDATE inquiries SET notes=?,version=version+1 WHERE id=? AND version=?",
      ["Stale overwritten note", "conversation", 1],
    ),
  ).toBe(0);
  await expect(
    source.execute("UPDATE inquiries SET stage=? WHERE id=?", ["unsupported", "conversation"]),
  ).rejects.toThrow();
  const backup = await exportDatabase(source);
  expect(backup.payload.format).toBe(4);
  await restoreDatabase(target, backup);
  expect((await exportDatabase(target)).payload.tables).toEqual(backup.payload.tables);
  const payload = structuredClone(backup.payload);
  payload.format = 3;
  payload.migrations = payload.migrations.slice(0, 3);
  payload.tables.inquiries = payload.tables.inquiries.map(({ stage, notes, version, ...row }) => {
    void stage;
    void notes;
    void version;
    return row;
  });
  const legacy = parseBackup({
    payload,
    checksum: createHash("sha256").update(JSON.stringify(payload)).digest("hex"),
  });
  expect(legacy.payload.tables.inquiries[0]).toMatchObject({ stage: "new", notes: "", version: 1 });
}
