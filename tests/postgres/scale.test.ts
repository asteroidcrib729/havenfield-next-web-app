import { it, expect } from "vitest";
import { Pool } from "pg";
import { randomUUID } from "node:crypto";
import { writeFile } from "node:fs/promises";
import { format, resolveConfig } from "prettier";
import { createDatabase, migrateDatabase } from "../../src/server/database";
it("bounds pagination and pooling on 5000 synthetic PostgreSQL articles", async () => {
  const value = process.env.HAVENFIELD_TEST_DATABASE_URL;
  if (!value) throw new Error("Use the isolated PostgreSQL test runner");
  const url = new URL(value);
  if (
    !["localhost", "127.0.0.1", "[::1]"].includes(url.hostname) ||
    !/^\/havenfield_test_/.test(url.pathname)
  )
    throw new Error("Unsafe scale database");
  const admin = new Pool({ connectionString: url.toString() });
  const schema = "scale_" + randomUUID().replaceAll("-", "");
  await admin.query(`CREATE SCHEMA ${schema}`);
  url.searchParams.set("options", `-c search_path=${schema}`);
  const db = await createDatabase({ url: url.toString() });
  try {
    await migrateDatabase(db);
    await db.script(
      "INSERT INTO posts(id,slug,title,excerpt,body,author,category,tags,cover_image,cover_alt,status,published_at,seo_title,seo_description,canonical_url,noindex,version,created_at,updated_at) SELECT 'fixture-'||n,'fixture-'||n,'Synthetic article '||n,'A synthetic introduction for scale measurements','Original synthetic body for pagination measurements','Havenfield','Design','[]','','','published','2026-10-01T00:00:00.000Z','','','',0,1,'2026-10-01T00:00:00.000Z','2026-10-01T00:00:00.000Z' FROM generate_series(1,5000) AS n;",
    );
    await db.script("ANALYZE posts;");
    const sql =
      "SELECT id,slug,title FROM posts WHERE status IN ('published','scheduled') AND published_at<=? ORDER BY COALESCE(published_at,created_at) DESC,id ASC LIMIT ? OFFSET ?";
    const started = performance.now();
    const rows = await db.query(sql, ["2026-10-14T00:00:00.000Z", 12, 4800]);
    const elapsed = performance.now() - started;
    expect(rows).toHaveLength(12);
    expect((await db.query("SELECT id FROM posts WHERE slug=?", ["fixture-100"]))[0].id).toBe(
      "fixture-100",
    );
    const publicationPlan = await db.query("EXPLAIN (ANALYZE,FORMAT JSON) " + sql, [
      "2026-10-14T00:00:00.000Z",
      12,
      4800,
    ]);
    const slugPlan = await db.query(
      "EXPLAIN (ANALYZE,FORMAT JSON) SELECT id FROM posts WHERE slug=?",
      ["fixture-100"],
    );
    expect(JSON.stringify(slugPlan)).toContain("Index Scan");
    const connections = await Promise.all(
      Array.from({ length: 10 }, () => db.query("SELECT pg_backend_pid() AS pid,pg_sleep(0.02)")),
    );
    expect(new Set(connections.map((rows) => rows[0].pid)).size).toBeLessThanOrEqual(2);
    await db.execute(
      "INSERT INTO app_settings(key,value) VALUES('deployment_environment','production')",
    );
    await expect(createDatabase({ url: url.toString() })).rejects.toThrow("binding");
    const evidencePath = "development-plans/database-scale-evidence.json";
    await writeFile(
      evidencePath,
      await format(
        JSON.stringify({
          measuredAt: new Date().toISOString(),
          engine: "Actual local PostgreSQL 18",
          articles: 5000,
          pagination: { limit: 12, offset: 4800, elapsedMs: elapsed },
          maximumObservedPoolConnections: new Set(connections.map((rows) => rows[0].pid)).size,
          publicationPlan,
          slugPlan,
        }),
        { ...(await resolveConfig(evidencePath)), filepath: evidencePath },
      ),
    );
  } finally {
    await db.close();
    await admin.query(`DROP SCHEMA ${schema} CASCADE`);
    await admin.end();
  }
});
