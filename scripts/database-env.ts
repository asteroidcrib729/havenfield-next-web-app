import { existsSync } from "node:fs";
import { resolve } from "node:path";

// Native Node 24 parsing; deployment-provided variables always take precedence.
for (const filename of [".env.local", ".env"]) {
  const path = resolve(filename);
  if (existsSync(path)) process.loadEnvFile(path);
}
// The CLI deliberately prefers a direct endpoint; runtime functions use the pooled URL.
if (process.env.DIRECT_DATABASE_URL) process.env.DATABASE_URL = process.env.DIRECT_DATABASE_URL;
