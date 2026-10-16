import { spawn, type ChildProcess } from "node:child_process";
import { randomBytes, randomUUID } from "node:crypto";
import { mkdir, mkdtemp, rm, writeFile, unlink } from "node:fs/promises";
import { createServer } from "node:net";
import { resolve, relative, isAbsolute } from "node:path";

function testUrl(value: string): string {
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new Error("TEST_DATABASE_URL must be a valid loopback test database URL");
  }
  if (
    !["postgres:", "postgresql:"].includes(url.protocol) ||
    !["localhost", "127.0.0.1", "[::1]"].includes(url.hostname) ||
    !/^\/havenfield_test_[a-z0-9_]+$/.test(url.pathname)
  )
    throw new Error(
      "PostgreSQL tests require a loopback havenfield_test_* database; production URLs are refused",
    );
  return url.toString();
}
async function availablePort(): Promise<number> {
  const server = createServer();
  await new Promise<void>((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", resolve);
  });
  const address = server.address();
  if (!address || typeof address === "string") throw new Error("No loopback test port available");
  await new Promise<void>((resolve, reject) =>
    server.close((error) => (error ? reject(error) : resolve())),
  );
  return address.port;
}
async function run(command: string, args: string[]): Promise<void> {
  await new Promise<void>((resolve, reject) => {
    const child = spawn(command, args, { windowsHide: true, stdio: ["ignore", "ignore", "pipe"] });
    let error = "";
    child.stderr.on("data", (chunk) => (error = (error + String(chunk)).slice(-4096)));
    child.once("error", reject);
    child.once("close", (code) =>
      code === 0 ? resolve() : reject(new Error(`PostgreSQL utility exited ${code}: ${error}`)),
    );
  });
}
async function cleanup(directory: string) {
  const path = relative(resolve(".data"), resolve(directory));
  if (isAbsolute(path) || path.startsWith("..") || !path.startsWith("postgres-test-"))
    throw new Error("Refusing test cleanup outside its owned directory");
  await rm(directory, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 });
}
let directory: string | undefined;
let postgres: ChildProcess | undefined;
let stopped: Promise<void> | undefined;
let pgCtl: string | undefined;
let clusterPath: string | undefined;
let externalConnection: import("pg").Client | undefined;
let externalSchema: string | undefined;
try {
  let url = process.env.TEST_DATABASE_URL;
  if (url) {
    url = testUrl(url);
    const { Client } = await import("pg");
    externalConnection = new Client({ connectionString: url });
    await externalConnection.connect();
    externalSchema = `test_${randomUUID().replaceAll("-", "")}`;
    await externalConnection.query(`CREATE SCHEMA ${externalSchema}`);
    const isolated = new URL(url);
    isolated.searchParams.set("options", `-c search_path=${externalSchema}`);
    url = isolated.toString();
  } else {
    const platform = process.platform === "win32" ? "windows" : process.platform;
    const binaries = (await import(`@embedded-postgres/${platform}-${process.arch}`)) as {
      initdb: string;
      postgres: string;
      pg_ctl: string;
    };
    pgCtl = binaries.pg_ctl;
    await mkdir(".data", { recursive: true });
    directory = await mkdtemp(resolve(".data/postgres-test-"));
    clusterPath = resolve(directory, "cluster");
    const passwordFile = resolve(directory, "password.tmp");
    const password = randomBytes(32).toString("hex");
    await writeFile(passwordFile, password + "\n", { mode: 0o600, flag: "wx" });
    try {
      await run(binaries.initdb, [
        "-D",
        clusterPath,
        "--username=havenfield_test",
        "--auth=scram-sha-256",
        `--pwfile=${passwordFile}`,
        "--locale=C",
        "--encoding=UTF8",
      ]);
    } finally {
      await unlink(passwordFile);
    }
    const port = await availablePort();
    postgres = spawn(
      binaries.postgres,
      ["-D", clusterPath, "-p", String(port), "-h", "127.0.0.1", "-c", "lc_messages=C"],
      { windowsHide: true, stdio: ["ignore", "ignore", "pipe"] },
    );
    const server = postgres;
    stopped = new Promise<void>((resolve) => server.once("close", () => resolve()));
    await new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(
        () => reject(new Error("Local PostgreSQL did not become ready within 20 seconds")),
        20_000,
      );
      server.once("error", (error) => {
        clearTimeout(timeout);
        reject(error);
      });
      server.once("exit", (code) => {
        clearTimeout(timeout);
        reject(new Error(`Local PostgreSQL exited before readiness (${code})`));
      });
      server.stderr?.on("data", (chunk) => {
        if (String(chunk).includes("database system is ready to accept connections")) {
          clearTimeout(timeout);
          resolve();
        }
      });
    });
    const { Client } = await import("pg");
    const client = new Client({
      host: "127.0.0.1",
      port,
      user: "havenfield_test",
      password,
      database: "postgres",
    });
    await client.connect();
    const database = `havenfield_test_${randomUUID().replaceAll("-", "")}`;
    try {
      await client.query(`CREATE DATABASE ${database}`);
    } finally {
      await client.end();
    }
    url = testUrl(`postgresql://havenfield_test:${password}@127.0.0.1:${port}/${database}`);
  }
  console.log("Running integration tests against an isolated real PostgreSQL database.");
  const child = spawn(
    process.execPath,
    ["node_modules/vitest/vitest.mjs", "run", "--config", "vitest.postgres.config.ts"],
    {
      stdio: "inherit",
      windowsHide: true,
      env: {
        ...process.env,
        DATABASE_URL: "",
        DIRECT_DATABASE_URL: "",
        APP_ENV: "development",
        LOCAL_PREVIEW: "0",
        VERCEL_ENV: "",
        VERCEL_URL: "",
        NEXT_PUBLIC_SITE_URL: "",
        SITE_URL: "",
        VERCEL: "",
        BLOB_READ_WRITE_TOKEN: "",
        HAVENFIELD_TEST_DATABASE_URL: url,
      },
    },
  );
  process.exitCode = await new Promise<number>((resolve, reject) => {
    child.once("error", reject);
    child.once("exit", (code) => resolve(code ?? 1));
  });
} finally {
  if (externalConnection) {
    if (externalSchema) await externalConnection.query(`DROP SCHEMA ${externalSchema} CASCADE`);
    await externalConnection.end();
  }
  if (postgres && pgCtl && clusterPath && postgres.exitCode === null) {
    await run(pgCtl, ["stop", "-D", clusterPath, "-m", "fast", "-w", "-t", "10"]);
    await stopped;
  }
  if (directory) await cleanup(directory);
}
