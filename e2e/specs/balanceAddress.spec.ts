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

    // Navigate using baseURL from playwright config
    await page.goto("/");
    // Log the page URL to debug
    console.log("DEBUG: Initial navigation to:", page.url());

    // Wait for the document to be fully loaded
    await page.waitForLoadState("domcontentloaded");

    await page.waitForLoadState("networkidle");

    // Add longer timeout to ensure page is fully loaded
    await page.waitForTimeout(5000);

    // Check if page loaded correctly
    const pageTitle = await page.title();
    console.log("DEBUG: Page title:", pageTitle);

    // Retry navigation if needed
    if (!pageTitle || pageTitle === "about:blank") {
      console.log("DEBUG: Retrying navigation...");
      await page.goto("/", { timeout: 30000 });
      await page.waitForLoadState("domcontentloaded");
      await page.waitForLoadState("networkidle");
      await page.waitForTimeout(3000);
    }

    // await injectBTCWallet(page);

    // await injectBBNWallet(page, "Leap");

    await setupWalletConnection(page);

    await page.waitForTimeout(5000);
  });

  test("balance is correct", async ({ page }) => {
    // Add diagnostic information before looking for elements
    console.log("DEBUG: Test started, URL =", page.url());
    console.log(
      "DEBUG: Document readyState =",
      await page.evaluate(() => document.readyState),
    );

    // Check if we're on the right page
    const content = await page.content();
    if (!content.includes("Staked Balance")) {
      console.log(
        "DEBUG: Page doesn't contain 'Staked Balance', attempting to force navigation again",
      );
      await page.goto("/", { timeout: 60000, waitUntil: "networkidle" });
      await page.waitForTimeout(10000); // Give more time to load
    }

    const spinners = page.locator(".bbn-list-item .bbn-loader");
    try {
      await spinners.waitFor({ state: "hidden", timeout: 5e3 });
    } catch (error) {
      console.log("DEBUG: Waiting for spinners failed, forcing resize");
      await page.evaluate(() => {
        window.dispatchEvent(new Event("resize"));
      });
    }

    // Dump HTML content to see what we're actually looking at
    console.log(
      "DEBUG: HTML snippet:",
      (await page.content()).substring(0, 2000),
    );

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
