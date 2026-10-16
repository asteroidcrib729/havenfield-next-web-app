import { AppError } from "../src/server/errors";
import nextEnv from "@next/env";
import { configurationSummary, serverEnvironment } from "../src/server/environment";
nextEnv.loadEnvConfig(process.cwd());
try {
  serverEnvironment();
  const summary = configurationSummary();
  console.log(JSON.stringify(summary, null, 2));
  if (
    summary.environment !== "development" &&
    (!summary.database || !summary.publisher || !summary.media)
  )
    process.exitCode = 1;
} catch (error) {
  console.error(
    error instanceof AppError
      ? error.message
      : "Configuration is incomplete. Check the environment matrix in development-plans/operator-guide.md; private values are never printed.",
  );
  process.exitCode = 1;
}
