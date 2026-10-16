import "./database-env";
import { readFile, stat } from "node:fs/promises";
import { resolve } from "node:path";
import { createDatabase } from "../src/server/database";
import { parseBackup, restoreDatabase } from "../src/server/backup";
const input = process.argv[2];
if (
  !input ||
  Boolean(process.env.RESTORE_DATABASE_URL) === Boolean(process.env.RESTORE_SQLITE_PATH)
)
  throw new Error(
    "Specify a backup file and exactly one dedicated RESTORE_DATABASE_URL or RESTORE_SQLITE_PATH; the normal database is never the default restore target",
  );
const path = resolve(input);
if ((await stat(path)).size > 100 * 1024 * 1024)
  throw new Error("Backup exceeds the 100 MiB restore limit");
const backup = parseBackup(JSON.parse(await readFile(path, "utf8")));
const db = await createDatabase({
  url: process.env.RESTORE_DATABASE_URL || "",
  sqlitePath: process.env.RESTORE_SQLITE_PATH,
  autoMigrate: false,
  verifyEnvironment: false,
});
try {
  await restoreDatabase(db, backup);
  console.log(
    "Backup restored into the explicitly configured empty target. Verify content and media before switching production.",
  );
} finally {
  await db.close();
}
