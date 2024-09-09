import { expect, test } from "@playwright/test";

test.describe("App", () => {
  test("should have a title", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/Staking Dashboard/);
  });
});
