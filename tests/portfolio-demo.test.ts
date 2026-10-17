import { expect, it, afterAll, beforeAll } from "vitest";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { csvCell, inquiryPatch } from "../src/lib/inquiry-workflow";
import { properties } from "../src/content/properties";
import { matchingFloorPlan } from "../src/content/floor-plans";
import { createDatabase, closeDatabase, getDatabase } from "../src/server/database";
import {
  createInquiry,
  listInquiries,
  changeInquiry,
  exportInquiries,
} from "../src/server/inquiries";
import { inquiryConversationContract } from "./inquiry-workflow-contract";
let directory: string;
beforeAll(async () => {
  directory = await mkdtemp(join(tmpdir(), "havenfield-portfolio-"));
  process.env.DATABASE_URL = "";
  process.env.SQLITE_PATH = join(directory, "app.sqlite");
  process.env.APP_ENV = "development";
  process.env.LOCAL_PREVIEW = "0";
});
afterAll(async () => {
  await closeDatabase();
  await rm(directory, { recursive: true, force: true, maxRetries: 5 });
});
it("has distinct compatible concept plans and suppresses changed specifications", () => {
  expect(properties.map((p) => matchingFloorPlan(p))).toHaveLength(4);
  for (const home of properties) {
    expect(matchingFloorPlan(home)).not.toBeNull();
    expect(matchingFloorPlan({ ...home, bedrooms: home.bedrooms + 1 })).toBeNull();
  }
  expect(matchingFloorPlan({ ...properties[0], id: "new-home" })).toBeNull();
});
it("quotes spreadsheet content and neutralizes formula prefixes", () => {
  for (const value of ["=SUM(1,1)", " +123", "@IMPORTXML()", "\tattack", "-1+2", "\r=1"])
    expect(csvCell(value)).toMatch(/^"'/);
  expect(csvCell('A "quoted", sentence')).toBe('"A ""quoted"", sentence"');
  expect(csvCell("Ordinary note")).toBe('"Ordinary note"');
  expect(inquiryPatch.safeParse({ stage: "closed" }).success).toBe(false);
  expect(inquiryPatch.safeParse({ notes: "x".repeat(4001), version: 1 }).success).toBe(false);
});
it("persists conversations, applies filters and rejects stale writes without exposing notes in audit", async () => {
  const receipt = await createInquiry(new Request("http://localhost/api/inquiries"), {
    name: "Conversation Example",
    email: "conversation@example.test",
    phone: "",
    message: "An invented demonstration inquiry about a home.",
    propertyId: "",
    consent: true,
    idempotencyKey: crypto.randomUUID(),
  });
  await changeInquiry(receipt.id, "reviewed", "test-editor", {
    stage: "contacted",
    notes: "=An internal note",
    version: 1,
  });
  const found = await listInquiries({ stage: "contacted", propertyId: "general" });
  expect(found.items.some((row) => row.id === receipt.id)).toBe(true);
  await expect(
    changeInquiry(receipt.id, undefined, "test-editor", { notes: "stale", version: 1 }),
  ).rejects.toMatchObject({ status: 409 });
  expect((await listInquiries({ stage: "closed" })).total).toBe(0);
  const csv = await exportInquiries({ stage: "contacted" });
  expect(csv).toContain("'=An internal note");
  const db = await getDatabase();
  expect(JSON.stringify(await db.query("SELECT * FROM publisher_actions"))).not.toContain(
    "An internal note",
  );
});
it("round-trips conversation fields and upgrades format-3 backups", async () => {
  const source = await createDatabase({
      url: "",
      sqlitePath: join(directory, "source.sqlite"),
      verifyEnvironment: false,
    }),
    target = await createDatabase({
      url: "",
      sqlitePath: join(directory, "target.sqlite"),
      verifyEnvironment: false,
    });
  try {
    await inquiryConversationContract(source, target);
  } finally {
    await source.close();
    await target.close();
  }
});

it("publishes only selected original drafts and preserves the other three on repeated runs", async () => {
  const { execFileSync } = await import("node:child_process"),
    { DatabaseSync } = await import("node:sqlite");
  const { resolve } = await import("node:path");
  const file = join(directory, "editorial.sqlite");
  const env = {
    ...process.env,
    DATABASE_URL: "",
    DIRECT_DATABASE_URL: "",
    SQLITE_PATH: file,
    APP_ENV: "development",
    LOCAL_PREVIEW: "0",
    VERCEL: "",
    VERCEL_ENV: "",
    VERCEL_URL: "",
    SITE_URL: "http://localhost:3000",
    NEXT_PUBLIC_SITE_URL: "http://localhost:3000",
  };
  const run = (script: string, args: string[] = []) =>
    execFileSync(process.execPath, ["--import", "tsx", resolve(script), ...args], {
      env,
      encoding: "utf8",
      windowsHide: true,
      stdio: ["ignore", "pipe", "pipe"],
    });
  run("scripts/database-seed.ts");
  run("scripts/plan03-content.ts", ["--environment=development", "--apply"]);
  const dry = JSON.parse(run("scripts/plan04-content.ts", ["--environment=development"]));
  expect(dry.published).toHaveLength(3);
  const applied = JSON.parse(
    run("scripts/plan04-content.ts", ["--environment=development", "--apply"]),
  );
  expect(applied.published).toHaveLength(3);
  const again = JSON.parse(
    run("scripts/plan04-content.ts", ["--environment=development", "--apply"]),
  );
  expect(again.published).toHaveLength(0);
  expect(again.alreadyPublic).toHaveLength(3);
  const db = new DatabaseSync(file);
  try {
    expect(
      db.prepare("SELECT count(*) AS total FROM posts WHERE status='published'").get()?.total,
    ).toBe(6);
    expect(
      db.prepare("SELECT count(*) AS total FROM posts WHERE status='draft'").get()?.total,
    ).toBe(3);
    const row = db
      .prepare("SELECT body FROM posts WHERE slug='read-a-floor-plan-in-everyday-routes'")
      .get();
    expect(String(row?.body)).toContain("\n\n##");
  } finally {
    db.close();
  }
}, 30000);
