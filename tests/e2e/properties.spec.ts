import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
async function signIn(page: Page) {
  await page.goto("/admin/login");
  await page.getByLabel("Email").fill("editor@havenfield.test");
  await page.getByLabel("Password").fill(process.env.E2E_PASSWORD!);
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(page).toHaveURL(/\/admin$/);
}
const headers = { origin: "http://localhost:3100", "x-requested-with": "Havenfield" };
async function accessible(page: Page) {
  const scan = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze();
  expect(scan.violations.map((v) => ({ id: v.id, targets: v.nodes.map((n) => n.target) }))).toEqual(
    [],
  );
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
}
test("property authoring preserves drafts, gallery order, conflicts, revisions and visitor choices", async ({
  page,
  context,
}) => {
  test.setTimeout(180000);
  await signIn(page);
  await page.goto("/admin/properties/new");
  const slug = "browser-home-" + Date.now(),
    name = "Browser Garden House";
  await page.getByLabel("Property name", { exact: true }).fill(name);
  await page.getByLabel("Property URL slug").fill(slug);
  await page.getByLabel("Fictional locality").fill("Invented Gardens");
  await page.getByLabel("Setting", { exact: true }).fill("Garden");
  await page
    .getByLabel("Property introduction")
    .fill("An invented garden home created to verify publisher authoring and public visibility.");
  await page
    .getByLabel("Features (one per line)", { exact: true })
    .fill("Sheltered garden\nOak reading room");
  for (let i = 0; i < 2; i++) {
    await page.getByRole("button", { name: "Add gallery image", exact: true }).click();
    const picker = page.getByRole("dialog", { name: "Choose an image" });
    await picker.getByRole("button", { name: "Show repository images" }).click();
    await picker.getByLabel("Repository collection").selectOption("courtyard");
    await picker.getByRole("button", { name: "Use image", exact: true }).nth(i).click();
  }
  await page.getByRole("button", { name: "Move photograph 2 earlier", exact: true }).click();
  await page
    .getByLabel("Photograph 1 alternative text", { exact: true })
    .fill("A sheltered invented living room beside a planted courtyard");
  await page.getByLabel(/Photograph 1 horizontal focal point/).fill("68");
  await page.getByRole("button", { name: "Add story section", exact: true }).click();
  await page.getByLabel("Story 1 heading").fill("A slower arrival");
  await page
    .getByLabel("Story 1 text")
    .fill("A planted threshold leads from the imagined street to a sheltered shared room.");
  await page.getByRole("button", { name: "Preview concept", exact: true }).click();
  await expect(page.getByRole("region", { name: "Private property preview" })).toBeVisible();
  await page.setViewportSize({ width: 320, height: 900 });
  await accessible(page);
  await page.getByRole("button", { name: "Save property", exact: true }).click();
  await expect(page).toHaveURL(/\/admin\/properties\/hf-[a-f0-9-]+$/);
  const id = page.url().split("/").pop()!;
  const fetchRecord = async () =>
    (await (await page.request.get("/api/admin/properties/" + id)).json()).property;
  let record = await fetchRecord();
  expect(record.galleryItems[0].url).toContain("courtyard-living");
  expect(record.galleryItems[0].focalX).toBe(68);
  expect((await page.request.get("/properties/" + slug)).status()).toBe(404);
  expect(await (await page.request.get("/sitemap.xml")).text()).not.toContain(slug);
  await page.getByLabel("Publication status").selectOption("published");
  await page.getByRole("button", { name: "Save property", exact: true }).click();
  await expect(page.getByText("Property saved as published.", { exact: true })).toBeVisible();
  const visitor = await context.newPage();
  await visitor.goto("/properties/" + slug);
  await expect(visitor.getByRole("heading", { name, exact: true })).toBeVisible();
  await visitor.getByRole("button", { name: "Save " + name, exact: true }).click();
  await visitor.getByRole("button", { name: "Compare " + name, exact: true }).click();
  await visitor.goto("/saved");
  await expect(visitor.getByRole("heading", { name, exact: true })).toBeVisible();
  await visitor.goto("/compare");
  await expect(visitor.getByRole("link", { name, exact: true })).toBeVisible();
  await visitor.goto("/contact?property=" + id);
  await expect(visitor.getByLabel("A home you have in mind")).toHaveValue(id);
  await visitor.close();
  record = await fetchRecord();
  const { id: discardId, version, createdAt, updatedAt, ...input } = record;
  void discardId;
  void createdAt;
  void updatedAt;
  expect(
    (
      await page.request.patch("/api/admin/properties/" + id, {
        headers,
        data: { version, property: { ...input, name: "A newer saved name" } },
      })
    ).status(),
  ).toBe(200);
  await page.getByLabel("Property name", { exact: true }).fill("Unsaved writing survives");
  await page.getByRole("button", { name: "Save property", exact: true }).click();
  await expect(page.getByRole("alert").filter({ hasText: "This property changed" })).toContainText(
    "This property changed",
  );
  await expect(page.getByLabel("Property name", { exact: true })).toHaveValue(
    "Unsaved writing survives",
  );
  await page.getByRole("link", { name: "Back to properties", exact: true }).click();
  await expect(page.getByRole("dialog", { name: "Leave unsaved property changes?" })).toBeVisible();
  await page.getByRole("button", { name: "Keep editing", exact: true }).click();
  await expect(page.getByLabel("Property name", { exact: true })).toHaveValue(
    "Unsaved writing survives",
  );
  await page.getByRole("button", { name: "Reload saved property", exact: true }).click();
  await page.getByRole("button", { name: "Discard edits and reload", exact: true }).click();
  await expect(page.getByLabel("Property name", { exact: true })).toHaveValue("A newer saved name");
  await page.getByRole("button", { name: "Property revisions", exact: true }).click();
  await page.getByRole("button", { name: "Restore property version 1", exact: true }).click();
  await page.getByRole("button", { name: "Restore property revision", exact: true }).click();
  await expect(
    page.getByText("Revision restored as a new saved version.", { exact: true }),
  ).toBeVisible();
  expect((await page.request.get("/properties/" + slug)).status()).toBe(404);
  await page.getByRole("button", { name: "Delete property", exact: true }).click();
  await page.getByRole("button", { name: "Delete property permanently", exact: true }).click();
  await expect(page).toHaveURL(/\/admin\/properties$/);
  expect((await page.request.get("/api/admin/properties/" + id)).status()).toBe(404);
});
test("media collection and crop defaults persist, expose property usage and keep repository files read-only", async ({
  page,
}) => {
  test.setTimeout(150000);
  await signIn(page);
  await page.goto("/admin/media");
  const alt = "Garden crop upload " + Date.now();
  await page.getByLabel("Alternative text", { exact: true }).fill(alt);
  await page.getByLabel("Image file").setInputFiles("public/media/plan03/contact-studio.webp");
  await page.getByRole("button", { name: "Upload image", exact: true }).click();
  let card = page.locator("article").filter({ hasText: alt });
  await expect(card).toHaveCount(1);
  await card.getByRole("button", { name: "Edit description", exact: true }).click();
  const dialog = page.getByRole("dialog", { name: "Image details and crops" });
  await dialog.getByLabel("Image collection").fill("Garden studies");
  await dialog.getByLabel(/Horizontal focal point/).fill("70");
  await dialog.getByLabel(/Vertical focal point/).fill("35");
  await page.setViewportSize({ width: 320, height: 900 });
  await accessible(page);
  await dialog.getByRole("button", { name: "Save image details", exact: true }).click();
  await expect(dialog).toHaveCount(0);
  await page.getByLabel("Filter image collection").selectOption("Garden studies");
  await expect(card).toHaveCount(1);
  await card.getByRole("button", { name: "Edit description", exact: true }).click();
  await expect(dialog.getByLabel(/Horizontal focal point/)).toHaveValue("70");
  await expect(dialog.getByLabel(/Vertical focal point/)).toHaveValue("35");
  await page.keyboard.press("Escape");
  await expect(card.getByRole("button", { name: "Edit description", exact: true })).toBeFocused();
  const media = (
    await (await page.request.get("/api/admin/media?collection=Garden%20studies")).json()
  ).items.find((item: { alt: string }) => item.alt === alt);
  const seeded = (await (await page.request.get("/api/admin/properties/hf-01")).json()).property;
  const { id, version, createdAt, updatedAt, ...input } = seeded;
  void id;
  void version;
  void createdAt;
  void updatedAt;
  const created = await page.request.post("/api/admin/properties", {
    headers,
    data: {
      ...input,
      slug: "media-home-" + Date.now(),
      name: "Media Reference Home",
      status: "draft",
      galleryItems: [
        { url: media.url, alt: media.alt, focalX: media.focalX, focalY: media.focalY },
      ],
    },
  });
  expect(created.status()).toBe(201);
  const home = (await created.json()).property;
  await page.reload();
  card = page.locator("article").filter({ hasText: alt });
  await expect(card.getByRole("button", { name: "Delete image", exact: true })).toBeDisabled();
  await card.getByRole("button", { name: "View references", exact: true }).click();
  await expect(card.getByRole("link", { name: home.name, exact: true }).first()).toHaveAttribute(
    "href",
    "/admin/properties/" + home.id,
  );
  await accessible(page);
  expect(
    (
      await page.request.delete("/api/admin/properties/" + home.id, {
        headers,
        data: { version: home.version },
      })
    ).status(),
  ).toBe(200);
  await page.getByRole("button", { name: "Show repository images", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Repository images", exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Delete image", exact: true })).toHaveCount(0);
  await page.getByRole("button", { name: "View references", exact: true }).first().click();
  await expect(
    page.getByRole("link", { name: "The Courtyard House", exact: true }).first(),
  ).toBeVisible();
  await accessible(page);
  await page.getByRole("button", { name: "Show uploaded images", exact: true }).click();
  await page.getByLabel("Filter image collection").selectOption("Garden studies");
  await expect(card.getByRole("button", { name: "Delete image", exact: true })).toBeEnabled();
  await card.getByRole("button", { name: "Delete image", exact: true }).click();
  await page.getByRole("button", { name: "Delete permanently", exact: true }).click();
  await expect(card).toHaveCount(0);
});
