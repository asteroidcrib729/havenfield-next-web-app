import { afterEach, expect, it } from "vitest";
import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { randomBytes } from "node:crypto";
import { createDatabase } from "../src/server/database";
import { exportDatabase } from "../src/server/backup";
import { createRecoveryBundle } from "../src/server/recovery-bundle";
import {
  decryptBackupBytes,
  decryptRecoveryBundle,
  encryptBackupBytes,
  encryptRecoveryBundle,
} from "../src/server/encrypted-backup";

let root: string | undefined;
afterEach(async () => {
  if (root?.startsWith(resolve(".data/encryption-test-")))
    await rm(root, { recursive: true, force: true });
  root = undefined;
});
it("authenticates ciphertext, rejects wrong keys, and randomizes repeated exports", () => {
  const key = randomBytes(32),
    plain = Buffer.from("private fictional draft");
  const one = encryptBackupBytes(plain, key),
    two = encryptBackupBytes(plain, key);
  expect(one.equals(two)).toBe(false);
  expect(one.includes(plain)).toBe(false);
  expect(decryptBackupBytes(one, key)).toEqual(plain);
  expect(() => decryptBackupBytes(one, randomBytes(32))).toThrow(/authentication/);
  const tampered = Buffer.from(one);
  tampered[tampered.length - 1] ^= 1;
  expect(() => decryptBackupBytes(tampered, key)).toThrow(/authentication/);
  expect(() => decryptBackupBytes(one.subarray(0, 12), key)).toThrow();
});
it("round-trips a complete recovery bundle and refuses overwrite and path traversal", async () => {
  await mkdir(".data", { recursive: true });
  root = await mkdtemp(resolve(".data/encryption-test-"));
  const db = await createDatabase({ url: "", sqlitePath: resolve(root, "source.sqlite") });
  try {
    const bundle = resolve(root, "bundle");
    await createRecoveryBundle(await exportDatabase(db), bundle, async () => Buffer.alloc(0));
    const key = randomBytes(32),
      archive = resolve(root, "snapshot.hfbackup"),
      restored = resolve(root, "restored");
    await encryptRecoveryBundle(bundle, archive, key);
    await expect(encryptRecoveryBundle(bundle, archive, key)).rejects.toThrow();
    await decryptRecoveryBundle(archive, restored, key);
    expect(await readFile(resolve(restored, "database.json"))).toEqual(
      await readFile(resolve(bundle, "database.json")),
    );
    await expect(decryptRecoveryBundle(archive, restored, key)).rejects.toThrow();
    const malicious = resolve(root, "malicious.hfbackup");
    await writeFile(
      malicious,
      encryptBackupBytes(
        Buffer.from(
          JSON.stringify({
            format: 1,
            files: { "database.json": "e30=", "manifest.json": "e30=", "../outside": "eA==" },
          }),
        ),
        key,
      ),
    );
    await expect(decryptRecoveryBundle(malicious, resolve(root, "unsafe"), key)).rejects.toThrow(
      /Unsafe/,
    );
  } finally {
    await db.close();
  }
});
