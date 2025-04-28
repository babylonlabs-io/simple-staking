import { expect, test } from "@playwright/test";
import { setupServer } from "msw/node";

import {
  dismissGenesisDialog,
  setupWalletConnection,
} from "../middleware/connect";
import {
  injectBBNQueries,
  injectBBNWallet,
  injectBTCWallet,
} from "../mocks/blockchain";
import { handlers, mockVerifyBTCAddress } from "../mocks/handlers";

const server = setupServer(...handlers);

test.describe("Balance and address checks after connection", () => {
  test.beforeAll(() => {
    server.listen();
  });

  test.afterAll(() => {
    server.close();
  });

  test.beforeEach(async ({ page }) => {
    server.resetHandlers();

    await mockVerifyBTCAddress(page);
    await injectBBNQueries(page);

    await page.goto("http://localhost:3000");

    await dismissGenesisDialog(page);

    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2000);

    await injectBTCWallet(page);

    await injectBBNWallet(page);

    await setupWalletConnection(page);

    await page.waitForTimeout(5000);
  });

  test("balance is correct", async ({ page }) => {
    const spinners = page.locator(".bbn-list-item .bbn-loader");
    try {
      await spinners.waitFor({ state: "hidden", timeout: 5e3 });
    } catch (error) {
      await page.evaluate(() => {
        window.dispatchEvent(new Event("resize"));
      });
    }

    const stakedBalance = await page
      .locator('.bbn-list-item:has-text("Staked Balance") .bbn-list-value')
      .textContent();
    const stakableBalance = await page
      .locator('.bbn-list-item:has-text("Stakable Balance") .bbn-list-value')
      .textContent();
    const babyBalance = await page
      .locator('.bbn-list-item:has-text("BABY Balance") .bbn-list-value')
      .textContent();
    const babyRewards = await page
      .locator('.bbn-list-item:has-text("BABY Rewards") .bbn-list-value')
      .textContent();

    expect(stakedBalance).toContain("0 BTC");
    expect(stakableBalance).toContain("0.00074175 BTC");
    expect(babyBalance).toContain("1 BABY");
    expect(babyRewards).toContain("0.5 BABY");
  });
});
