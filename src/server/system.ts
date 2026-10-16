import { getDatabase } from "./database";
import { configurationSummary } from "./environment";
export async function readiness() {
  const db = await getDatabase();
  await db.query("SELECT 1 AS ready");
  return true;
}
export async function systemSummary() {
  const config = configurationSummary();
  let database = false;
  try {
    database = await readiness();
  } catch {
    /* Report availability without exposing private connection errors. */
  }
  const db = database ? await getDatabase() : null;
  const actions = db
    ? await db.query(
        "SELECT actor,action,target,created_at FROM publisher_actions ORDER BY created_at DESC,id DESC LIMIT 30",
      )
    : [];
  const migrations = db
    ? await db.query("SELECT version,name,applied_at FROM schema_migrations ORDER BY version")
    : [];
  const [maintenance] = db
    ? await db.query(
        "SELECT created_at FROM publisher_actions WHERE actor=? AND action=? ORDER BY created_at DESC,id DESC LIMIT 1",
        ["maintenance", "inquiry.expiry"],
      )
    : [];
  return {
    configuration: config,
    databaseReady: database,
    actions,
    migrations,
    lastMaintenanceAt: maintenance ? String(maintenance.created_at) : null,
  };
}
