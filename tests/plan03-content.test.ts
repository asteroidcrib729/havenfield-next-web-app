import { expect, it } from "vitest";
import { readFile, mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { execFileSync } from "node:child_process";
import { DatabaseSync } from "node:sqlite";
import { createHash } from "node:crypto";
import { properties } from "../src/content/properties";
import { journalDrafts } from "../src/content/journal-drafts";
import { storyHomes } from "../src/content/content-links";
it("all 28 distinct generated assets have intact outputs and coherent four-view property sets", async () => {
  const manifest = JSON.parse(await readFile("development-plans/plan-03-assets.json", "utf8"));
  expect(manifest.assets).toHaveLength(28);
  expect(new Set(manifest.assets.map((a: { sourceSha256: string }) => a.sourceSha256)).size).toBe(
    28,
  );
  for (const asset of manifest.assets) {
    expect(asset.approval).toBe("technical-review-passed");
    const bytes = await readFile(asset.outputPath);
    expect(createHash("sha256").update(bytes).digest("hex")).toBe(asset.sha256);
    expect(bytes.length).toBeLessThanOrEqual(350 * 1024);
  }
  for (const home of properties) {
    expect(home.gallery).toHaveLength(4);
    const assigned = manifest.assets
      .filter((a: { propertySlug: string }) => a.propertySlug === home.slug)
      .map((a: { outputPath: string }) => "/" + a.outputPath.replace(/^public\//, ""));
    expect(home.gallery).toEqual(assigned);
    expect(home.image).toBe(home.gallery[0]);
  }
});
it("new editorial drafts remain private and recommendations use real fictional property IDs", () => {
  expect(journalDrafts).toHaveLength(6);
  for (const draft of journalDrafts) {
    expect(draft.status).toBe("draft");
    expect(draft.noindex).toBe(true);
    expect(draft.publishedAt).toBeNull();
    expect(draft.body.split(/\s+/).length).toBeGreaterThan(200);
  }
  for (const ids of Object.values(storyHomes))
    for (const id of ids) expect(properties.some((home) => home.id === id)).toBe(true);
});
it("explicit content import is idempotent and preserves edited copy and custom covers", async () => {
  const dir = await mkdtemp(join(tmpdir(), "havenfield-content-")),
    path = join(dir, "test.sqlite");
  const env = {
    ...process.env,
    APP_ENV: "development",
    LOCAL_PREVIEW: "0",
    VERCEL: "",
    VERCEL_ENV: "",
    VERCEL_URL: "",
    DATABASE_URL: "",
    DIRECT_DATABASE_URL: "",
    SQLITE_PATH: path,
    NEXT_PUBLIC_SITE_URL: "http://localhost:3000",
    SITE_URL: "http://localhost:3000",
  };
  const run = (script: string, args: string[] = []) =>
    execFileSync(process.execPath, ["--import", "tsx", resolve(script), ...args], {
      env,
      encoding: "utf8",
      windowsHide: true,
      stdio: ["ignore", "pipe", "pipe"],
    });
  try {
    run("scripts/database-seed.ts");
    const db = new DatabaseSync(path);
    db.prepare("UPDATE posts SET cover_image=?,body=? WHERE slug=?").run(
      "/media/interior.jpg",
      "Owner-edited copy remains intact.",
      "a-home-that-fits-your-everyday",
    );
    db.prepare("UPDATE posts SET cover_image=? WHERE slug=?").run(
      "/media/courtyard.jpg",
      "the-value-of-a-thoughtful-floor-plan",
    );
    db.close();
    const dry = JSON.parse(run("scripts/plan03-content.ts", ["--environment=development"]));
    expect(dry.apply).toBe(false);
    expect(dry.createdDrafts).toHaveLength(6);
    let check = new DatabaseSync(path);
    expect(check.prepare("SELECT count(*) AS total FROM posts").get()?.total).toBe(3);
    check.close();
    const applied = JSON.parse(
      run("scripts/plan03-content.ts", ["--environment=development", "--apply"]),
    );
    expect(applied.createdDrafts).toHaveLength(6);
    expect(applied.updatedCovers).toEqual(["a-home-that-fits-your-everyday"]);
    const again = JSON.parse(
      run("scripts/plan03-content.ts", ["--environment=development", "--apply"]),
    );
    expect(again.createdDrafts).toEqual([]);
    expect(again.updatedCovers).toEqual([]);
    check = new DatabaseSync(path);
    const row = check
      .prepare("SELECT body,version FROM posts WHERE slug=?")
      .get("a-home-that-fits-your-everyday");
    expect(row?.body).toBe("Owner-edited copy remains intact.");
    expect(row?.version).toBe(2);
    expect(
      check.prepare("SELECT count(*) AS total FROM posts WHERE status='draft' AND noindex=1").get()
        ?.total,
    ).toBe(6);
    check.close();
  } finally {
    await rm(dir, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 });
  }
}, 30000);
