import nextEnv from "@next/env";
import { spawn } from "node:child_process";
import { createDatabase } from "../src/server/database";
import { serverEnvironment } from "../src/server/environment";

nextEnv.loadEnvConfig(process.cwd(), true);
const environment = serverEnvironment();
if (
  !environment.localPreview ||
  !environment.databaseUrl ||
  !environment.authReady ||
  !environment.blobToken
)
  throw new Error(
    "Configure the private local Preview environment first; see development-plans/local-preview.md",
  );
const database = await createDatabase({ autoMigrate: false });
try {
  await database.query("SELECT 1 AS ready");
} finally {
  await database.close();
}
console.log(
  "Preview database binding verified. Local edits share the Preview database and media store; Production is separate.",
);
const address = new URL(environment.mutationOrigin!);
if (address.protocol !== "http:")
  throw new Error("The local Preview launcher requires an HTTP loopback SITE_URL");
const child = spawn(
  process.execPath,
  [
    "node_modules/next/dist/bin/next",
    "dev",
    "--hostname",
    address.hostname.replace(/^\[|\]$/g, ""),
    "--port",
    address.port || "80",
  ],
  { stdio: "inherit", windowsHide: true },
);
process.exitCode = await new Promise<number>((resolve, reject) => {
  child.once("error", reject);
  child.once("exit", (code) => resolve(code ?? 1));
});
