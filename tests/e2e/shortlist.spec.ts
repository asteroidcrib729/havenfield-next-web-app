import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
test("saved homes persist, synchronize across tabs and clear independently", async ({
  page,
  context,
}) => {
  await page.goto("/properties");
  await page.getByRole("button", { name: "Save The Courtyard House", exact: true }).click();
  await page.getByRole("button", { name: "Compare The Courtyard House", exact: true }).click();
  await page.reload();
  await expect(
    page.getByRole("button", { name: "Save The Courtyard House", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  const second = await context.newPage();
  await second.goto("/saved");
  await expect(
    second.getByRole("heading", { name: "The Courtyard House", exact: true }),
  ).toBeVisible();
  await second.getByRole("button", { name: "Clear saved homes", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Save The Courtyard House", exact: true }),
  ).toHaveAttribute("aria-pressed", "false");
  await expect(
    page.getByRole("button", { name: "Compare The Courtyard House", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  await second.close();
});
test("comparison enforces three, supports removal and stays within a narrow viewport", async ({
  page,
}) => {
  await page.goto("/properties");
  for (const name of ["The Courtyard House", "Saltwater Residence", "Woodland Pavilion"])
    await page.getByRole("button", { name: "Compare " + name, exact: true }).click();
  await page.getByRole("button", { name: "Compare Atelier Loft", exact: true }).click();
  await expect(
    page.getByText("Compare up to three homes. Remove one before adding another."),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Compare Atelier Loft", exact: true }),
  ).toHaveAttribute("aria-pressed", "false");
  await page.goto("/compare");
  await page.setViewportSize({ width: 320, height: 900 });
  await expect(page.getByRole("table")).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  const scan = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze();
  expect(scan.violations.map((v) => v.id)).toEqual([]);
  await page
    .getByRole("button", { name: "Remove Saltwater Residence from comparison", exact: true })
    .click();
  await page.goto("/properties");
  await page.getByRole("button", { name: "Compare Atelier Loft", exact: true }).click();
  await page.goto("/compare");
  await expect(page.getByRole("link", { name: "Atelier Loft", exact: true })).toBeVisible();
  await page.reload();
  await expect(page.getByRole("table")).toBeVisible();
  await page.getByRole("button", { name: "Clear comparison", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Consider them side by side." })).toBeVisible();
});
test("filter chips retain other URL state and blocked storage has a temporary fallback", async ({
  page,
}) => {
  await page.goto("/properties?region=Coast&type=Villa&sort=space");
  await page.getByRole("button", { name: "Remove filter: Coast", exact: true }).click();
  await expect(page.getByLabel("Home type")).toHaveValue("Villa");
  await expect(page.getByLabel("Sort by")).toHaveValue("space");
  expect(new URL(page.url()).searchParams.has("region")).toBe(false);
  await page.addInitScript(() => {
    Object.defineProperty(Storage.prototype, "setItem", {
      configurable: true,
      value() {
        throw new DOMException("Blocked", "SecurityError");
      },
    });
  });
  await page.goto("/properties");
  await page.getByRole("button", { name: "Save Atelier Loft", exact: true }).click();
  await expect(page.getByText(/Your browser blocked storage/)).toBeVisible();
  await page.getByRole("link", { name: "Saved homes (1)", exact: true }).click();
  await expect(page).toHaveURL(/\/saved$/);
  await expect(page.getByRole("heading", { name: "Atelier Loft", exact: true })).toBeVisible();
  await page.reload();
  await expect(page.getByRole("heading", { name: "A little room for possibility." })).toBeVisible();
});
