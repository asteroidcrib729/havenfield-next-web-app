import { randomBytes } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import {
  decryptRecoveryBundle,
  encryptRecoveryBundle,
  readBackupKey,
} from "../src/server/encrypted-backup";

const [mode, source, output] = process.argv.slice(2);
const keyFile = resolve(process.env.BACKUP_KEY_FILE || ".cache/backup-encryption.key");
try {
  if (mode === "key") {
    await mkdir(dirname(keyFile), { recursive: true });
    await writeFile(keyFile, randomBytes(32), { flag: "wx", mode: 0o600 });
    console.log(
      "Private recovery key created. Keep a separate protected copy outside this computer and outside the backup folder. Existing keys are never overwritten.",
    );
  } else {
    if (!source || !output || !["encrypt", "decrypt"].includes(mode))
      throw new Error("Specify encrypt/decrypt, an input and a new output path");
    const key = await readBackupKey(keyFile);
    const result =
      mode === "encrypt"
        ? await encryptRecoveryBundle(source, output, key)
        : await decryptRecoveryBundle(source, output, key);
    console.log(JSON.stringify({ operation: mode, verified: true, ...result }));
  }
} catch {
  console.error(
    "Backup operation refused. Check the private key, input integrity, new output path and size limit. Existing output files and restore directories are never overwritten.",
  );
  process.exitCode = 1;
}
