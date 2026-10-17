import { test, expect } from "@playwright/test";
test("unavailable saved and comparison identities can be removed to free slots", async ({
  page,
}) => {
  await page.goto("/properties");
  await page.evaluate(() =>
    localStorage.setItem(
      "havenfield.homes.v1",
      JSON.stringify({
        version: 1,
        saved: ["hf-5ee692de-647d-4be2-9124-358922901c40"],
        compare: ["hf-5ee692de-647d-4be2-9124-358922901c40", "hf-02", "hf-03"],
      }),
    ),
  );
  await page.reload();
  await page.getByRole("button", { name: "Compare Atelier Loft", exact: true }).click();
  await expect(
    page.getByText("Compare up to three homes. Remove one before adding another.", { exact: true }),
  ).toBeVisible();
  await page.goto("/compare");
  await expect(page.getByRole("link", { name: "Compare homes (2/3)", exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Remove unavailable choices", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Remove unavailable choices", exact: true }),
  ).toHaveCount(0);
  await page.goto("/properties");
  await page.getByRole("button", { name: "Compare Atelier Loft", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Compare Atelier Loft", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  await page.goto("/saved");
  await expect(page.getByText(/0 saved homes/)).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Remove unavailable choices", exact: true }),
  ).toHaveCount(0);
});
