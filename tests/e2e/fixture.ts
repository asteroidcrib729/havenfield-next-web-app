import { test as base } from "@playwright/test";
import { DatabaseSync } from "node:sqlite";
import { resolve, relative, isAbsolute } from "node:path";
import { lstatSync } from "node:fs";
export { expect, type Page } from "@playwright/test";
export const test = base.extend<{ isolatedRateLimits: void }>({
  isolatedRateLimits: [
    async ({ baseURL }, use) => {
      if (baseURL !== "http://localhost:3100")
        throw Error("Only the isolated local test origin can reset counters");
      const file = resolve(process.env.E2E_SQLITE_PATH || "");
      const part = relative(resolve(".data"), file).replaceAll("\\", "/");
      if (
        isAbsolute(part) ||
        !/^e2e-test-[a-f0-9-]{36}\/database\.sqlite$/.test(part) ||
        lstatSync(file).isSymbolicLink()
      )
        throw Error("Refusing rate-limit reset outside the runner-owned isolated database");
      const db = new DatabaseSync(file);
      try {
        db.exec("PRAGMA busy_timeout=5000; DELETE FROM rate_limits;");
      } finally {
        db.close();
      }
      await use();
    },
    { auto: true },
  ],
});
