import { spawn } from "node:child_process";
import { randomUUID } from "node:crypto";
import { lstat, rm } from "node:fs/promises";
import { resolve, relative, isAbsolute } from "node:path";
const directory = resolve(`.data/e2e-test-${randomUUID()}`);
if (process.env.E2E_SQLITE_PATH)
  throw Error(
    "The browser runner owns its isolated database; custom E2E_SQLITE_PATH overrides are refused",
  );
try {
  const child = spawn(
    process.execPath,
    ["node_modules/@playwright/test/cli.js", "test", ...process.argv.slice(2)],
    {
      stdio: "inherit",
      windowsHide: true,
      env: {
        ...process.env,
        E2E_OWNED_DIRECTORY: directory,
        E2E_SQLITE_PATH: resolve(directory, "database.sqlite"),
        APP_ENV: "development",
        VERCEL_ENV: "",
        VERCEL: "",
        VERCEL_URL: "",
      },
    },
  );
  process.exitCode = await new Promise((done, reject) => {
    child.once("error", reject);
    child.once("exit", (code) => done(code ?? 1));
  });
} finally {
  await cleanup();
}
async function cleanup() {
  const part = relative(resolve(".data"), directory);
  if (isAbsolute(part) || !/^e2e-test-[a-f0-9-]{36}$/.test(part))
    throw Error("Unsafe browser cleanup");
  try {
    if ((await lstat(directory)).isSymbolicLink()) throw Error("Unsafe browser fixture link");
    await rm(directory, { recursive: true, force: true, maxRetries: 10, retryDelay: 200 });
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }
}
