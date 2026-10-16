import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
async function signIn(page: import("@playwright/test").Page) {
  await page.goto("/admin/login");
  await page.getByLabel("Email").fill("editor@havenfield.test");
  await page.getByLabel("Password").fill(process.env.E2E_PASSWORD!);
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(page).toHaveURL(/\/admin$/);
}
async function accessible(page: import("@playwright/test").Page) {
  const result = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  expect(
    result.violations.map((v) => ({ id: v.id, targets: v.nodes.map((n) => n.target) })),
  ).toEqual([]);
}
test("shareable discovery, keyboard gallery/navigation and CSP", async ({ page }) => {
  const violations: string[] = [];
  await page.addInitScript(() =>
    document.addEventListener("securitypolicyviolation", (event) =>
      console.error(`CSP_TEST:${event.violatedDirective}:${event.blockedURI}`),
    ),
  );
  page.on("console", (event) => {
    if (event.text().startsWith("CSP_TEST:")) violations.push(event.text());
  });
  await page.goto("/properties?region=Woodland&sort=space");
  await expect(page.getByLabel("Setting")).toHaveValue("Woodland");
  await expect(page.getByRole("status")).toHaveText(/1 home/);
  await page.getByRole("link", { name: "View Woodland Pavilion", exact: true }).click();
  await page.getByRole("button", { name: "Next photograph" }).focus();
  await page.keyboard.press("ArrowRight");
  await expect(page.getByText("2 / 3")).toBeVisible();
  await accessible(page);
  await page.getByRole("link", { name: "Back to the collection" }).click();
  await expect(page.getByLabel("Setting")).toHaveValue("Woodland");
  await page.reload();
  await expect(page.getByLabel("Setting")).toHaveValue("Woodland");
  await accessible(page);
  await page.setViewportSize({ width: 375, height: 900 });
  await page.getByRole("button", { name: "Open navigation" }).click();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("button", { name: "Open navigation" })).toBeFocused();
  const posts = await (await page.request.get("/api/posts")).json();
  await page.goto(`/journal/${posts.posts[0].slug}`);
  await accessible(page);
  const response = await page.request.get(`/journal/${posts.posts[0].slug}`);
  expect(response.headers()["content-security-policy"]).toContain("'strict-dynamic'");
  const html = await response.text();
  expect(html).toMatch(/nonce="[^"]+" type="application\/ld\+json"/);
  expect(violations).toEqual([]);
});
test("hero decode failure and data saving keep the poster visible", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/");
  await expect(page.locator("video")).toBeVisible();
  await page.locator("video").evaluate((element) => element.dispatchEvent(new Event("error")));
  await expect(page.locator("video")).toHaveCount(0);
  await expect(page.locator("img").first()).toBeVisible();
  await page.addInitScript(() =>
    Object.defineProperty(navigator, "connection", {
      configurable: true,
      value: { saveData: true },
    }),
  );
  await page.reload();
  await expect(page.locator("video")).toHaveCount(0);
  await expect(page.locator("img").first()).toBeVisible();
});
test("publisher recovers interrupted writing, reuses media and operates the inbox", async ({
  page,
}) => {
  test.setTimeout(180000);
  await signIn(page);
  expect(
    (
      await page.request.post("/api/inquiries", {
        headers: { origin: "http://localhost:3100", "x-requested-with": "Havenfield" },
        data: {
          name: "Product Visitor",
          email: "product-inbox@example.test",
          message: "A synthetic inquiry for the full inbox workflow.",
          consent: true,
          idempotencyKey: crypto.randomUUID(),
        },
      })
    ).status(),
  ).toBe(201);
  await accessible(page);
  await page.getByRole("link", { name: "New article", exact: true }).last().click();
  const title = `Recovery journey ${Date.now()}`;
  await page.getByLabel("Article title", { exact: true }).fill(title);
  await page
    .getByLabel("Short introduction")
    .fill("Synthetic editorial writing for the full product workflow.");
  await page
    .getByLabel("Article body")
    .fill(
      "## A recovered story\n\nThoughtful original test writing that must survive a page reload.",
    );
  await expect(page.getByText("Recovery draft saved.", { exact: false })).toBeVisible();
  page.on("dialog", (dialog) => dialog.accept());
  await page.reload();
  await expect(page.getByRole("heading", { name: "Interrupted writing found" })).toBeVisible();
  await page.getByRole("button", { name: "Recover writing", exact: true }).click();
  await expect(page.getByLabel("Article title", { exact: true })).toHaveValue(title);
  await page.getByRole("button", { name: "Reuse library image" }).click();
  const picker = page.getByRole("dialog", { name: "Choose an image" });
  await picker
    .getByLabel("Alternative text", { exact: true })
    .fill("Courtyard concept uploaded for the media workflow.");
  await picker.getByLabel("Image file").setInputFiles("public/media/courtyard.jpg");
  await picker.getByRole("button", { name: "Upload image", exact: true }).click();
  await expect(
    picker.getByText("Courtyard concept uploaded for the media workflow.", { exact: true }),
  ).toBeVisible();
  await accessible(page);
  await picker.getByRole("button", { name: "Use image", exact: true }).first().click();
  await expect(page.getByLabel("Image description")).toHaveValue(
    "Courtyard concept uploaded for the media workflow.",
  );
  await page.getByRole("button", { name: "Save as draft", exact: true }).click();
  await expect(page).toHaveURL(/\/admin\/posts\/[a-f0-9-]+$/);
  const id = page.url().split("/").pop()!;
  await accessible(page);
  await page.route(`**/api/admin/posts/${id}`, (route) =>
    route.request().method() === "PATCH"
      ? route.fulfill({
          status: 503,
          contentType: "application/json",
          body: JSON.stringify({ error: "Synthetic temporary storage failure" }),
        })
      : route.continue(),
  );
  await page
    .getByLabel("Article body")
    .fill(
      "## Preserved after failure\n\nThis original test writing remains visible after a failed explicit save.",
    );
  await page.getByRole("button", { name: "Save article", exact: true }).click();
  await expect(
    page.getByRole("alert").filter({ hasText: "Synthetic temporary storage failure" }),
  ).toContainText("Synthetic temporary storage failure");
  await expect(page.getByLabel("Article body")).toContainText("Preserved after failure");
  await page.unroute(`**/api/admin/posts/${id}`);
  await page.getByRole("button", { name: "Save article", exact: true }).click();
  await expect(page.getByText("Draft saved.", { exact: true })).toBeVisible();
  await page.getByRole("link", { name: "Media library", exact: true }).click();
  const card = page
    .locator("article")
    .filter({ hasText: "Courtyard concept uploaded for the media workflow." });
  await expect(card.getByRole("button", { name: "Delete image", exact: true })).toBeDisabled();
  await card.getByRole("button", { name: "View references" }).click();
  await expect(card.getByRole("link", { name: title, exact: true }).first()).toBeVisible();
  await accessible(page);
  await page.getByRole("link", { name: "Inquiry inbox" }).click();
  await page.getByLabel("Search inquiries").fill("product-inbox@example.test");
  const inquiry = page.locator("article").filter({ hasText: "product-inbox@example.test" });
  await expect(inquiry).toHaveCount(1);
  await inquiry.getByRole("combobox").selectOption("reviewed");
  await expect(inquiry.getByRole("combobox")).toHaveValue("reviewed");
  await accessible(page);
  await inquiry.getByRole("button", { name: "Delete inquiry" }).click();
  await expect(page.getByRole("button", { name: "Keep records" })).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(inquiry.getByRole("button", { name: "Delete inquiry" })).toBeFocused();
  await inquiry.getByRole("button", { name: "Delete inquiry" }).click();
  await page.getByRole("button", { name: "Confirm deletion" }).click();
  await expect(page.getByText("Inquiry deleted.", { exact: true })).toBeVisible();
  await page.getByRole("link", { name: "Operations", exact: true }).click();
  await expect(page.getByRole("term").filter({ hasText: "databaseReady" })).toBeVisible();
  await accessible(page);
  await page.setViewportSize({ width: 320, height: 900 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: ".cache/screenshots/operations-mobile.png", fullPage: true });
});
test("real handlers reject wrong origins and missing mutation headers without exposing private reads", async ({
  page,
}) => {
  await signIn(page);
  const response = await page.request.get("/api/admin/posts");
  expect(response.status()).toBe(200);
  const post = (await response.json()).posts[0];
  expect(
    (
      await page.request.delete(`/api/admin/posts/${post.id}`, {
        headers: { origin: "https://attacker.test", "x-requested-with": "Havenfield" },
        data: { version: post.version },
      })
    ).status(),
  ).toBe(403);
  expect(
    (
      await page.request.delete(`/api/admin/posts/${post.id}`, {
        headers: { origin: "http://localhost:3100" },
        data: { version: post.version },
      })
    ).status(),
  ).toBe(403);
  expect((await page.request.get("/api/health")).status()).toBe(200);
  await page.getByRole("button", { name: "Sign out" }).click();
  await expect(page).toHaveURL(/\/admin\/login/);
  for (const route of [
    "/api/admin/media",
    "/api/admin/inquiries",
    "/api/admin/system",
    "/api/admin/taxonomy",
  ])
    expect((await page.request.get(route)).status()).toBe(401);
});
