import { test, expect } from "./fixture";
import { mkdir, writeFile } from "node:fs/promises";
test("record isolated portfolio walkthrough", async ({ browser }) => {
  test.skip(process.env.RECORD_WALKTHROUGH !== "1", "Explicit recording pass only");
  test.setTimeout(180000);
  await mkdir(".data/plan04-recording", { recursive: true });
  const context = await browser.newContext({
    baseURL: "http://localhost:3100",
    viewport: { width: 1280, height: 720 },
    recordVideo: { dir: ".data/plan04-recording", size: { width: 1280, height: 720 } },
  });
  const headers = { origin: "http://localhost:3100", "x-requested-with": "Havenfield" };
  const receipt = await context.request.post("/api/inquiries", {
    headers,
    data: {
      name: "Alex Example",
      email: "alex@example.test",
      phone: "",
      message: "I would like to understand the courtyard layout and how the living spaces connect.",
      propertyId: "hf-01",
      consent: true,
      idempotencyKey: crypto.randomUUID(),
    },
  });
  expect(receipt.ok()).toBe(true);
  expect(
    (
      await context.request.post("/api/auth/login", {
        headers,
        data: { email: "editor@havenfield.test", password: process.env.E2E_PASSWORD },
      })
    ).ok(),
  ).toBe(true);
  const page = await context.newPage(),
    video = page.video()!;
  page.setDefaultTimeout(15000);
  const caption = async (text: string) =>
    page.evaluate((text) => {
      let el = document.getElementById("recording-caption");
      if (!el) {
        el = document.createElement("div");
        el.id = "recording-caption";
        el.style.cssText =
          "position:fixed;bottom:16px;left:24px;right:24px;z-index:99999;background:#242b27;color:#fff;padding:12px 20px;border-radius:8px;font:14px sans-serif;pointer-events:none";
        document.body.append(el);
      }
      el.textContent = text;
    }, text);
  const scene = async (path: string, text: string, seconds = 4) => {
    await page.goto(path);
    await caption(text);
    await page.waitForTimeout(seconds * 1000);
  };
  await scene(
    "/",
    "Havenfield | Real application walkthrough | Fictional data in an isolated local database",
    5,
  );
  await scene("/properties", "01 | Discover homes with shareable filters");
  await page.getByLabel("Setting").selectOption("Woodland");
  await page.waitForTimeout(2500);
  await scene(
    "/properties/the-courtyard-house",
    "02 | Explore an original home concept and its gallery",
  );
  await page.getByRole("button", { name: "Next photograph" }).click();
  await page.waitForTimeout(2000);
  await scene(
    "/properties/the-courtyard-house/brochure",
    "03 | Print an illustrative property brochure or save it as a PDF",
  );
  await page.getByRole("heading", { name: "An illustrative arrangement" }).scrollIntoViewIfNeeded();
  await page.waitForTimeout(3000);
  await scene("/admin/properties/hf-01", "04 | Maintain property copy in the private studio", 3);
  await page
    .getByLabel("Property introduction")
    .fill(
      "An imagined limestone home arranged around a quiet, planted courtyard. Deep window reveals hold the afternoon shade; long views connect living spaces with a reflecting pool.",
    );
  await page.getByRole("button", { name: "Save property", exact: true }).click();
  await expect(page.getByText("Property saved as published.", { exact: true })).toBeVisible();
  await caption("Versioned property edits | Saved through the real application");
  await page.waitForTimeout(3500);
  await scene("/admin/posts/new", "05 | Prepare an original journal story", 2);
  await page.getByLabel("Article title", { exact: true }).fill("Light, space and everyday living");
  await page
    .getByLabel("Introduction")
    .fill(
      "A short study of the ordinary routes, changing light and quiet corners that shape a home.",
    );
  await page
    .getByLabel("Article body")
    .fill(
      "## A useful kind of quiet\n\nA home begins with everyday routes. Think about arriving with shopping, finding a place to read and sharing a meal.\n\n## Room for changing light\n\nMove a chair through the day and notice how the view changes. This fictional architectural study invites questions rather than promises.",
    );
  await page.getByRole("button", { name: "Publish now", exact: true }).click();
  await expect(page.getByText("Article published.", { exact: false })).toBeVisible();
  await caption(
    "Article published | Search metadata, revisions and public visibility share one workflow",
  );
  await page.waitForTimeout(4500);
  await scene("/admin/media", "06 | Manage imagery, descriptions, crops and content references", 5);
  await scene(
    "/admin/inquiries",
    "07 | Review an invented inquiry and record the next conversation",
    2,
  );
  await page.getByLabel("Search inquiries").fill("alex@example.test");
  const card = page.locator("article").filter({ hasText: "alex@example.test" });
  await card.getByLabel("Conversation stage for Alex Example").selectOption("viewing-requested");
  await card
    .getByLabel("Internal notes for Alex Example")
    .fill("Prepare the illustrative brochure and floor plan for the next conversation.");
  await card.getByRole("button", { name: "Save conversation" }).click();
  await expect(page.getByText("Conversation saved.", { exact: true })).toBeVisible();
  await caption("Private conversation notes and stages | No email sent or appointment booked");
  await page.waitForTimeout(5000);
  await scene("/studio-demo", "08 | A public, read-only tour makes the studio approachable", 4);
  await page.getByRole("button", { name: "4. Inquiries", exact: true }).click();
  await page.waitForTimeout(3000);
  await scene(
    "/properties",
    "Havenfield | Next.js | React | TypeScript | Tailwind | Relational persistence",
    4,
  );
  await context.close();
  await writeFile(
    ".data/plan04-recording/source.json",
    JSON.stringify({ source: await video.path(), isolated: true, synthetic: true }, null, 2),
  );
});
