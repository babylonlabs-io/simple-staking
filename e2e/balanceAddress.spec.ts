import { expect, test } from "@playwright/test";

import { dismissGenesisDialog, setupWalletConnection } from "./helper/connect";
import {
  injectBBNWallet,
  verifyBBNWalletInjected,
} from "./helper/injectBBNWallet";
import {
  injectBTCWallet,
  verifyWalletInjected,
} from "./helper/injectBTCWallet";

test.describe("Balance and address checks after connection", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to application
    await page.goto("http://localhost:3000");

    // Dismiss any initial dialogs
    await dismissGenesisDialog(page);

    // Wait for page to be stable
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2000);

    // Inject BTC wallet
    await injectBTCWallet(page);

    // Verify BTC wallet is injected
    const isBTCInjected = await verifyWalletInjected(page);
    expect(isBTCInjected).toBe(true);

    // Inject BBN wallet
    await injectBBNWallet(page);

    // Verify BBN wallet is injected
    const isBBNInjected = await verifyBBNWalletInjected(page);
    expect(isBBNInjected).toBe(true);

    await setupWalletConnection(page);
  });

  test("balance is correct", async ({ page }) => {
    // Check the balance element text
    const balance = await page.getByTestId("balance").textContent();
    expect(balance).toBe("0.12345678 BTC");
  });

  test("address is correct", async ({ page }) => {
    // Check the address element text
    const address = await page.getByTestId("address").textContent();
    expect(address).toBe("bc1p...97sd");
  });
});
