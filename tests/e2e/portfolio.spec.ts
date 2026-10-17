import { test, expect } from "./fixture";
import AxeBuilder from "@axe-core/playwright";
test("read-only studio covers four workflows without private API requests", async ({ page }) => {
  const requests: string[] = [];
  page.on("request", (request) => {
    if (request.url().includes("/api/admin") || !["GET", "HEAD"].includes(request.method()))
      requests.push(request.method() + " " + new URL(request.url()).pathname);
  });
  for (const width of [320, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto("/studio-demo");
    await expect(page.getByRole("heading", { name: "A considered editorial desk." })).toBeVisible();
    await page.getByLabel("Sample home").selectOption("hf-04");
    await expect(page.getByRole("heading", { name: "Atelier Loft" })).toBeVisible();
    await page.getByRole("button", { name: "2. Journal", exact: true }).click();
    await page.getByRole("button", { name: "Preview sample excerpt", exact: true }).click();
    await expect(page.getByText("Sample excerpt only.", { exact: false })).toBeVisible();
    await page.getByRole("button", { name: "3. Media", exact: true }).click();
    await expect(page.getByRole("heading", { name: "A coherent home, four views." })).toBeVisible();
    await page.getByRole("button", { name: "4. Inquiries", exact: true }).click();
    await expect(page.getByRole("heading", { name: "Alex Example" })).toBeVisible();
    expect(
      (await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze())
        .violations,
    ).toEqual([]);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
  }
  expect(requests).toEqual([]);
  expect((await page.request.get("/api/admin/inquiries/export")).status()).toBe(401);
});
test("four brochures print without chrome and unpublished homes remain private", async ({
  page,
}) => {
  for (const slug of [
    "the-courtyard-house",
    "saltwater-residence",
    "woodland-pavilion",
    "atelier-loft",
  ]) {
    await page.setViewportSize({ width: 375, height: 900 });
    await page.goto("/properties/" + slug);
    await page.getByRole("link", { name: "View printable brochure" }).click();
    await expect(page.getByRole("button", { name: "Print / save PDF" })).toBeVisible();
    await expect(page.getByRole("img", { name: /Concept arrangement for/ })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
    await page.emulateMedia({ media: "print" });
    await expect(page.locator("body > header")).toBeHidden();
    await expect(page.locator("footer")).toBeHidden();
    await expect(page.getByRole("button", { name: "Print / save PDF" })).toBeHidden();
    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "12mm", bottom: "12mm", left: "12mm", right: "12mm" },
    });
    expect(pdf.byteLength).toBeGreaterThan(10000);
    await page.emulateMedia({ media: "screen" });
  }
  expect((await page.request.get("/properties/unknown-home/brochure")).status()).toBe(404);
});
test("conversation saves survive reload, reject stale changes and export filtered notes", async ({
  page,
}) => {
  const headers = { origin: "http://localhost:3100", "x-requested-with": "Havenfield" };
  const email = "portfolio-conversation@example.test";
  await page.request.post("/api/inquiries", {
    headers,
    data: {
      name: "Portfolio Visitor",
      email,
      phone: "",
      message: "An invented inquiry about the courtyard layout.",
      propertyId: "hf-01",
      consent: true,
      idempotencyKey: crypto.randomUUID(),
    },
  });
  expect(
    (
      await page.request.post("/api/auth/login", {
        headers,
        data: { email: "editor@havenfield.test", password: process.env.E2E_PASSWORD },
      })
    ).status(),
  ).toBe(200);
  await page.goto("/admin/inquiries");
  await page.getByLabel("Search inquiries").fill(email);
  const card = page.locator("article").filter({ hasText: email });
  await expect(card).toHaveCount(1);
  const before = await (await page.request.get("/api/admin/inquiries?query=" + email)).json(),
    id = before.items[0].id;
  await card
    .getByLabel("Conversation stage for Portfolio Visitor")
    .selectOption("viewing-requested");
  await card
    .getByLabel("Internal notes for Portfolio Visitor")
    .fill("=Prepare the fictional brochure");
  await card.getByRole("button", { name: "Save conversation" }).click();
  await expect(page.getByText("Conversation saved.", { exact: true })).toBeVisible();
  await page.reload();
  await page.getByLabel("Search inquiries").fill(email);
  await expect(card.getByLabel("Internal notes for Portfolio Visitor")).toHaveValue(
    "=Prepare the fictional brochure",
  );
  await page
    .getByRole("combobox", { name: "Conversation stage", exact: true })
    .selectOption("viewing-requested");
  await page.getByRole("combobox", { name: "Property", exact: true }).selectOption("hf-01");
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("link", { name: "Export filtered CSV" }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe("havenfield-inquiries.csv");
  const csv = await page.request.get(
    "/api/admin/inquiries/export?query=" + email + "&stage=viewing-requested&propertyId=hf-01",
  );
  expect(await csv.text()).toContain("'=Prepare the fictional brochure");
  expect(csv.headers()["cache-control"]).toBe("no-store");
  expect(
    (
      await page.request.patch("/api/admin/inquiries/" + id, {
        headers,
        data: { notes: "A stale edit", version: before.items[0].version },
      })
    ).status(),
  ).toBe(409);
  await page.request.delete("/api/admin/inquiries/" + id, { headers });
});
