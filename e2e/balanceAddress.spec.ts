import { expect, test } from "@playwright/test";

import { setupWalletConnection } from "./helper/connect";

test.describe("Balance and address checks after connection", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await setupWalletConnection(page);
  });

  test("balance is correct", async ({ page }) => {
    const balance = await page.getByTestId("balance").textContent();
    expect(balance).toBe("0.12345678 BTC");
  });

  test("address is correct", async ({ page }) => {
    const address = await page.getByTestId("address").textContent();
    expect(address).toBe("bc1p...97sd");
  });
});
