import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { Pool, type PoolClient } from "pg";
import { migrateDatabase } from "./migrations";
import { serverEnvironment } from "./environment";
export { migrateDatabase } from "./migrations";
export interface Database {
  readonly dialect: "postgres" | "sqlite";
  query<T extends Record<string, unknown> = Record<string, unknown>>(
    sql: string,
    params?: unknown[],
  ): Promise<T[]>;
  execute(sql: string, params?: unknown[]): Promise<number>;
  script(sql: string): Promise<void>;
  transaction<T>(work: (db: Database) => Promise<T>): Promise<T>;
  close(): Promise<void>;
}
export function postgresSql(sql: string): string {
  let index = 0;
  return sql.replace(
    /'(?:''|[^'])*'|"(?:""|[^"])*"|--[^\r\n]*|\/\*[\s\S]*?\*\/|\$(\w*)\$[\s\S]*?\$\1\$|\?/g,
    (token) => (token === "?" ? `$${++index}` : token),
  );
}
function pgAdapter(connection: Pool | PoolClient): Database {
  return {
    dialect: "postgres",
    async query<T extends Record<string, unknown>>(sql: string, params: unknown[] = []) {
      return (await connection.query(params.length ? postgresSql(sql) : sql, params)).rows as T[];
    },
    async execute(sql, params = []) {
      return (await connection.query(params.length ? postgresSql(sql) : sql, params)).rowCount ?? 0;
    },
    async script(sql) {
      await connection.query(sql);
    },
    async transaction(work) {
      if (!(connection instanceof Pool)) throw new Error("Nested transactions are unsupported");
      const client = await connection.connect();
      try {
        await client.query("BEGIN");
        const result = await work(pgAdapter(client));
        await client.query("COMMIT");
        return result;
      } catch (error) {
        await client.query("ROLLBACK");
        throw error;
      } finally {
        client.release();
      }
    },
    async close() {
      if (!(connection instanceof Pool))
        throw new Error("A transaction cannot close its parent database");
      await connection.end();
    },
  };
}
export interface DatabaseOptions {
  url?: string;
  sqlitePath?: string;
  autoMigrate?: boolean;
  verifyEnvironment?: boolean;
}
export async function createDatabase(options: DatabaseOptions = {}): Promise<Database> {
  const databaseUrl = options.url ?? process.env.DATABASE_URL;
  if (options.verifyEnvironment !== false) {
    const env = serverEnvironment();
    if (env.hosted && !databaseUrl) throw new Error("Hosted operation requires PostgreSQL");
  }
  let db: Database;
  if (databaseUrl) {
    let url: URL;
    try {
      url = new URL(databaseUrl);
    } catch {
      throw new Error("DATABASE_URL must be a valid PostgreSQL connection URL");
    }
    if (!["postgres:", "postgresql:"].includes(url.protocol))
      throw new Error("DATABASE_URL must be a PostgreSQL connection URL");
    const local =
      !process.env.VERCEL &&
      !["preview", "production"].includes(process.env.APP_ENV || "") &&
      ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname);
    for (const key of ["sslmode", "ssl", "sslcert", "sslkey", "sslrootcert", "uselibpqcompat"])
      url.searchParams.delete(key);
    const ca = process.env.DATABASE_CA_CERT?.replace(/\\n/g, "\n");
    db = pgAdapter(
      new Pool({
        connectionString: url.toString(),
        max: 2,
        idleTimeoutMillis: 10_000,
        connectionTimeoutMillis: 10_000,
        query_timeout: 15_000,
        ssl: local ? false : { rejectUnauthorized: true, ...(ca ? { ca } : {}) },
      }),
    );
  } else {
    if (process.env.VERCEL)
      throw new Error("DATABASE_URL is required on Vercel; local SQLite cannot persist there");
    const { DatabaseSync } = await import("node:sqlite");
    const path = resolve(
      /* turbopackIgnore: true */ options.sqlitePath ||
        process.env.SQLITE_PATH ||
        ".data/havenfield.sqlite",
    );
    mkdirSync(dirname(path), { recursive: true });
    const sqlite = new DatabaseSync(path);
    sqlite.exec("PRAGMA foreign_keys=ON; PRAGMA journal_mode=WAL; PRAGMA busy_timeout=5000;");
    let queue = Promise.resolve();
    const run = <T>(fn: () => Promise<T>) => {
      const result = queue.then(fn);
      queue = result.then(
        () => undefined,
        () => undefined,
      );
      return result;
    };
    const raw: Database = {
      dialect: "sqlite",
      async query<T extends Record<string, unknown>>(sql: string, params: unknown[] = []) {
        return sqlite.prepare(sql).all(...(params as (string | number | null)[])) as T[];
      },
      async execute(sql, params = []) {
        return Number(sqlite.prepare(sql).run(...(params as (string | number | null)[])).changes);
      },
      async script(sql) {
        sqlite.exec(sql);
      },
      async transaction() {
        throw new Error("Nested transactions are unsupported");
      },
      async close() {
        throw new Error("A transaction cannot close its parent database");
      },
    };
    db = {
      dialect: "sqlite",
      query: (sql, params) => run(() => raw.query(sql, params)),
      execute: (sql, params) => run(() => raw.execute(sql, params)),
      script: (sql) => run(() => raw.script(sql)),
      transaction: (work) =>
        run(async () => {
          sqlite.exec("BEGIN IMMEDIATE");
          try {
            const result = await work(raw);
            sqlite.exec("COMMIT");
            return result;
          } catch (error) {
            sqlite.exec("ROLLBACK");
            throw error;
          }
        }),
      async close() {
        await queue;
        sqlite.close();
      },
    };
  }
  if (!databaseUrl && options.autoMigrate !== false) {
    try {
      await migrateDatabase(db);
    } catch (error) {
      await db.close();
      throw error;
    }
  }
  if (options.verifyEnvironment !== false) {
    try {
      const env = serverEnvironment();
      if (env.hosted && !databaseUrl) throw new Error("Hosted operation requires PostgreSQL");
      if (db.dialect === "postgres") {
        const [present] = await db.query("SELECT to_regclass('app_settings') AS present");
        const [binding] = present.present
          ? await db.query("SELECT value FROM app_settings WHERE key=?", ["deployment_environment"])
          : [];
        if ((binding && binding.value !== env.environment) || (env.hosted && !binding))
          throw new Error(
            "Database environment binding is missing or mismatched; use the binding CLI on the intended independent database",
          );
      }
    } catch (error) {
      await db.close();
      throw error;
    }
  }
  return db;
}
let instance: Promise<Database> | undefined;
export function getDatabase(): Promise<Database> {
  instance ??= createDatabase().catch((error) => {
    instance = undefined;
    throw error;
  });
  return instance;
}
export async function closeDatabase(): Promise<void> {
  const previous = instance;
  instance = undefined;
  if (previous) await (await previous).close();
}
