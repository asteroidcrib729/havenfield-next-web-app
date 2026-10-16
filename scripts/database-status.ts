import "./database-env";
import { createDatabase } from "../src/server/database";
import { serverEnvironment } from "../src/server/environment";

try {
  const environment = serverEnvironment();
  const database = await createDatabase({ autoMigrate: false });
  try {
    await database.query("SELECT 1 AS ready");
    const [binding] =
      database.dialect === "postgres"
        ? await database.query("SELECT value FROM app_settings WHERE key=?", [
            "deployment_environment",
          ])
        : [];
    console.log(
      JSON.stringify(
        {
          ready: true,
          environment: environment.environment,
          localPreview: environment.localPreview,
          dialect: database.dialect,
          binding: binding?.value ?? "development",
        },
        null,
        2,
      ),
    );
  } finally {
    await database.close();
  }
} catch {
  console.error(
    "Database readiness or environment binding failed. Check the private configuration; credentials are not printed.",
  );
  process.exitCode = 1;
}
