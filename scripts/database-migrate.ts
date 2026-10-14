import "./database-env";
import { createDatabase, migrateDatabase } from "../src/server/database";
const db = await createDatabase({ autoMigrate: false,verifyEnvironment:false });
try {
  const report = await migrateDatabase(db);
  console.log(`Database schema is ready (version ${report.currentVersion}; ${report.applied.length} new migrations${report.adoptedLegacy ? "; legacy version 1 adopted" : ""}).`);
} finally { await db.close(); }
