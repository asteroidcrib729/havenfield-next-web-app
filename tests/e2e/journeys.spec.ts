import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("hero video decodes, plays, pauses and resumes", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/");
  const film = page.locator("video");
  await expect(film).toBeVisible();
  await expect
    .poll(() => film.evaluate((element: HTMLVideoElement) => element.currentTime))
    .toBeGreaterThan(0.2);
  expect(
    await film.evaluate((element: HTMLVideoElement) => ({
      width: element.videoWidth,
      height: element.videoHeight,
      muted: element.muted,
      error: element.error?.code ?? null,
    })),
  ).toEqual({ width: 1280, height: 720, muted: true, error: null });
  await page.getByRole("button", { name: "Pause hero film" }).click();
  await expect.poll(() => film.evaluate((element: HTMLVideoElement) => element.paused)).toBe(true);
  await page.getByRole("button", { name: "Play hero film" }).click();
  await expect.poll(() => film.evaluate((element: HTMLVideoElement) => element.paused)).toBe(false);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(film).toHaveCount(0);
  await expect(page.locator("img").first()).toBeVisible();
});

test("public collection, filters, inquiry receipt and article discovery", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /Room for a/ })).toBeVisible();
  await expect(page.locator("img").first()).toBeVisible();
  await page.goto("/properties");
  await page.getByLabel("Setting").selectOption("Woodland");
  await expect(page.getByRole("status")).toHaveText(/1 home in/);
  await page.getByLabel("Search homes").fill("no matching home");
  await expect(page.getByText("No homes match these filters")).toBeVisible();
  await page.getByRole("button", { name: "Show all homes" }).click();
  await expect(page.getByRole("status")).toHaveText(/4 homes/);
  await page.goto("/contact");
  await page.getByLabel("Your name").fill("Alex Example");
  await page.getByLabel("Email", { exact: false }).fill("alex@example.test");
  await page
    .getByLabel("Your message")
    .fill("A fictional inquiry about the courtyard concept and its natural light.");
  await page.getByRole("checkbox").check();
  await page.getByRole("button", { name: "Send demo inquiry" }).click();
  await expect(page.getByRole("heading", { name: "Your inquiry was recorded." })).toBeVisible();
  await page.goto("/journal");
  await expect(page.getByRole("heading", { name: "A home that fits your everyday" })).toBeVisible();
  const stories = await (await page.request.get("/api/posts")).json();
  await page.goto(`/journal/${stories.posts[0].slug}`);
  await expect(page).toHaveTitle(
    stories.posts[0].seoTitle || `${stories.posts[0].title} | Havenfield`,
  );
  const rss = await page.request.get("/rss.xml");
  expect(rss.status()).toBe(200);
  expect(await rss.text()).toContain("<rss");
  const draft = await page.request.get("/api/admin/posts");
  expect(draft.status()).toBe(401);
});

test("responsive routes, reduced motion and accessible forms", async ({ page }) => {
  test.setTimeout(180_000);
  for (const width of [320, 375, 768, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    for (const route of [
      "/",
      "/properties",
      "/about",
      "/amenities",
      "/contact",
      "/journal",
      "/admin/login",
      "/saved",
      "/compare",
      "/privacy",
      "/terms",
      "/cookies",
      "/properties/the-courtyard-house",
      "/properties/saltwater-residence",
      "/properties/woodland-pavilion",
      "/properties/atelier-loft",
    ]) {
      await page.goto(route);
      await expect(page.locator("h1")).toBeVisible();
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
        `${route} at ${width}px`,
      ).toBe(true);
    }
  }
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await expect(page.locator("video")).toHaveCount(0);
  await page.goto("/admin/login");
  expect(
    (await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze())
      .violations,
  ).toEqual([]);
  await page.goto("/contact");
  const a11y = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze();
  expect(
    a11y.violations.map((v) => ({
      id: v.id,
      nodes: v.nodes.map((node) => ({ target: node.target, summary: node.failureSummary })),
    })),
  ).toEqual([]);
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/");
  await page.screenshot({ path: ".cache/screenshots/home-desktop.png", fullPage: true });
  await page.setViewportSize({ width: 375, height: 900 });
  await page.screenshot({ path: ".cache/screenshots/home-mobile.png", fullPage: true });
});

test("editor signs in, uploads a cover, saves, publishes, revises and deletes", async ({
  page,
}) => {
  test.setTimeout(180_000);
  await page.goto("/admin");
  await expect(page).toHaveURL(/\/admin\/login/);
  await page.getByLabel("Email").fill("editor@havenfield.test");
  await page.getByLabel("Password").fill(process.env.E2E_PASSWORD!);
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page).toHaveURL(/\/admin$/);
  await page.getByRole("link", { name: "New article", exact: true }).last().click();
  const title = `A test of thoughtful spaces ${Date.now()}`;
  await page.getByLabel("Article title", { exact: true }).fill(title);
  await page
    .getByLabel("Introduction")
    .fill("An original demonstration article created by the integrated browser test.");
  await page
    .getByLabel("Article body")
    .fill(
      "## Light and daily life\n\nA careful plan leaves room for the small rituals that make a home. This is synthetic test content.",
    );
  await page.getByLabel("Upload a cover image").setInputFiles("public/media/courtyard.jpg");
  await expect(page.getByLabel("Image URL")).toHaveValue(/\/api\/media\//);
  await page
    .getByLabel("Image description")
    .fill("Original fictional courtyard concept used for a test cover.");
  await page.getByLabel("SEO title", { exact: true }).fill("A test of thoughtful spaces");
  await page
    .getByLabel("Meta description")
    .fill(
      "Original test content about thoughtful spaces, daylight, and the everyday routines that shape a home.",
    );
  await page.getByRole("button", { name: "Save as draft", exact: true }).click();
  await expect(page).toHaveURL(/\/admin\/posts\/[a-f0-9-]+$/);
  const id = page.url().split("/").pop()!;
  const slug = await page.getByLabel("URL slug").inputValue();
  expect((await page.request.get(`/api/posts/${slug}`)).status()).toBe(404);
  await page.getByRole("button", { name: "Publish now", exact: true }).click();
  await expect(page.getByText("Article published.", { exact: false })).toBeVisible();
  expect((await page.request.get(`/api/posts/${slug}`)).status()).toBe(200);
  await page.setViewportSize({ width: 320, height: 900 });
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
    "populated editor at 320px",
  ).toBe(true);
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.screenshot({ path: ".cache/screenshots/editor-desktop.png", fullPage: true });
  await page.getByLabel("Article title", { exact: true }).fill(title + " revised");
  await page.getByLabel("URL slug").fill(slug + "-revised");
  await page.getByRole("button", { name: "Save article", exact: true }).click();
  await expect(page.getByText("Article published.", { exact: false })).toBeVisible();
  const old = await page.request.get(`/journal/${slug}`, { maxRedirects: 0 });
  expect([307, 308]).toContain(old.status());
  await page.getByRole("button", { name: "Revisions", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Revision history" })).toBeVisible();
  const first = page.locator("li").filter({ hasText: "Version 1" });
  await first.getByRole("button", { name: "Restore as draft" }).click();
  expect(
    (await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze())
      .violations,
  ).toEqual([]);
  await page.getByRole("button", { name: "Restore draft", exact: true }).click();
  await expect(page.getByText("Revision restored as a draft.", { exact: false })).toBeVisible();
  expect((await page.request.get(`/api/posts/${slug}`)).status()).toBe(404);
  await page.getByLabel("Status", { exact: true }).selectOption("scheduled");
  await page.getByLabel("Publication time").fill("2099-01-01T12:00");
  await page.getByRole("button", { name: "Save schedule", exact: true }).click();
  await expect(page.getByText("Article scheduled.", { exact: false })).toBeVisible();
  expect((await page.request.get(`/api/posts/${slug}`)).status()).toBe(404);
  await page.goto("/admin");
  await page.getByPlaceholder(/Search/).fill(title);
  await page
    .getByRole("button", { name: /Delete/ })
    .first()
    .click();
  await page.getByRole("button", { name: "Delete article", exact: true }).click();
  await expect(page.getByText(/was deleted\./)).toBeVisible();
  expect((await page.request.get(`/api/admin/posts/${id}`)).status()).toBe(404);
  await page.getByRole("button", { name: "Sign out" }).click();
  await expect(page).toHaveURL(/\/admin\/login/);
  expect((await page.request.get("/api/admin/posts")).status()).toBe(401);
});
