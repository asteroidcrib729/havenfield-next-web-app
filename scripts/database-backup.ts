import "./database-env";
import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { randomUUID } from "node:crypto";
import { closeDatabase, getDatabase } from "../src/server/database";
import { exportDatabase } from "../src/server/backup";
try {
  const backup = await exportDatabase(await getDatabase());
  const directory = resolve(".data/backups"); await mkdir(directory, { recursive: true });
  const path = resolve(directory, `havenfield-${new Date().toISOString().replace(/[:.]/g, "-")}-${randomUUID()}.json`);
  await writeFile(path, JSON.stringify(backup, null, 2) + "\n", { flag: "wx", mode: 0o600 });
  console.log(`Private database export written to ${path}. Media objects require a separate backup.`);
} finally { await closeDatabase(); }
