import "./database-env";
import { pruneRecoveryBundles } from "../src/server/backup-retention";
if (!process.env.BACKUP_DESTINATION)
  throw new Error(
    "Specify the independent BACKUP_DESTINATION; pruning never defaults to this checkout",
  );
console.log(
  JSON.stringify(
    await pruneRecoveryBundles(process.env.BACKUP_DESTINATION, !process.argv.includes("--apply")),
    null,
    2,
  ),
);
