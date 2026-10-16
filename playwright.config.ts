import { defineConfig } from "@playwright/test";
import { randomBytes, randomUUID, scryptSync } from "node:crypto";
const password = process.env.E2E_PASSWORD || randomBytes(24).toString("base64url");
const salt = randomBytes(32).toString("hex");
process.env.E2E_PASSWORD = password;
const sqlitePath = process.env.E2E_SQLITE_PATH || `.data/e2e-${randomUUID()}.sqlite`;
process.env.E2E_SQLITE_PATH = sqlitePath;
export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 90_000,
  expect: { timeout: 30_000 },
  workers: 1,
  reporter: "list",
  use: {
    baseURL: "http://localhost:3100",
    channel: process.env.PLAYWRIGHT_CHANNEL || "msedge",
    trace: "retain-on-failure",
  },
  webServer: {
    command:
      "node --import tsx scripts/database-seed.ts && node node_modules/next/dist/bin/next build && node node_modules/next/dist/bin/next start --hostname localhost --port 3100",
    url: "http://localhost:3100",
    reuseExistingServer: false,
    timeout: 240_000,
    env: {
      DATABASE_URL: "",
      DIRECT_DATABASE_URL: "",
      VERCEL: "",
      SQLITE_PATH: sqlitePath,
      NEXT_PUBLIC_SITE_URL: "http://localhost:3100",
      SITE_URL: "http://localhost:3100",
      ADMIN_EMAIL: "editor@havenfield.test",
      ADMIN_PASSWORD_HASH: `scrypt:${salt}:${scryptSync(password, salt, 64).toString("hex")}`,
      SESSION_SECRET: randomBytes(48).toString("base64url"),
      BLOB_READ_WRITE_TOKEN: "",
      LOCAL_UPLOAD_DIR: process.env.E2E_OWNED_DIRECTORY
        ? `${process.env.E2E_OWNED_DIRECTORY}/uploads`
        : `${sqlitePath}.uploads`,
      APP_ENV: "development",
      LOCAL_PREVIEW: "0",
      VERCEL_ENV: "",
      VERCEL_URL: "",
    },
  },
});
