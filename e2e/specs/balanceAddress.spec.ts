import { expect, test } from "@playwright/test";
import { setupServer } from "msw/node";

import { setupWalletConnection } from "../middleware/connect";
import { injectBBNQueries } from "../mocks/blockchain";
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
    // Capture browser console logs and page errors for CI debugging
    page.on("console", (msg) => {
      // Print all browser console messages with their type
      console.log(`BROWSER CONSOLE [${msg.type()}]:`, msg.text());
    });

    page.on("pageerror", (err) => {
      console.log("BROWSER PAGE ERROR:", err);
    });

    server.resetHandlers();

    await mockVerifyBTCAddress(page);

    await injectBBNQueries(page);

    await page.goto("http://localhost:3000");

    await page.waitForLoadState("networkidle");

    await page.waitForTimeout(2000);

    // await injectBTCWallet(page);

    // await injectBBNWallet(page, "Leap");

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
    const stakedBalance = page.locator(
      '.bbn-list-item:has-text("Staked Balance") .bbn-list-value',
    );

    const stakedCount = await stakedBalance.count();
    // Debug output for CI to understand why the locator is not found.
    console.log('DEBUG: "Staked Balance" locator count =', stakedCount);
    if (stakedCount === 0) {
      const currentUrl = page.url();
      const pageHtmlSnippet = (await page.content()).slice(0, 1000);
      console.log("DEBUG: Current page URL =", currentUrl);
      console.log("DEBUG: First 1000 chars of page HTML:\n", pageHtmlSnippet);
    }

    const stakedBalanceText = await stakedBalance.textContent();
    const stakableBalance = await page
      .locator('.bbn-list-item:has-text("Stakable Balance") .bbn-list-value')
      .textContent();
    const babyBalance = await page
      .locator('.bbn-list-item:has-text("BABY Balance") .bbn-list-value')
      .textContent();
    const babyRewards = await page
      .locator('.bbn-list-item:has-text("BABY Rewards") .bbn-list-value')
      .textContent();

    expect(stakedBalanceText).toContain("0.09876543 BTC");
    expect(stakableBalance).toContain("0.00074175 BTC");
    expect(babyBalance).toContain("1 BABY");
    expect(babyRewards).toContain("0.5 BABY");
  });
});
