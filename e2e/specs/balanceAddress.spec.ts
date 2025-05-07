import { expect, test } from "@playwright/test";
import { setupServer } from "msw/node";

import { setupWalletConnection } from "../middleware/connect";
import { injectBBNQueries } from "../mocks/blockchain";
import { handlers, mockVerifyBTCAddress } from "../mocks/handlers";

const server = setupServer(...handlers);

test.describe("Balance and address checks after connection", () => {
  test.beforeAll(() => {
    server.listen();

    // Log MSW request events to verify mocks are active in CI.
    server.events.on("request:start", (req) => {
      console.log(`MSW ▶️  ${req.method} ${req.url.href}`);
    });

    server.events.on("request:match", (req) => {
      console.log(`MSW ✅ Matched ${req.method} ${req.url.href}`);
    });

    server.events.on("request:unhandled", (req) => {
      console.log(`MSW ❓ Unhandled ${req.method} ${req.url.href}`);
    });
  });

  test.afterAll(() => {
    server.close();
  });

  test.beforeEach(async ({ page }) => {
    // Intercept requests to log and ignore 404s without fulfilling responses (MSW should handle).
    await page.route("**/*", (route) => {
      const url = route.request().url();

      // Always allow main document.
      if (route.request().resourceType() === "document") {
        return route.continue();
      }

      // Continue other resources; log failures.
      route.continue().catch(() => {
        console.log(`DEBUG: Resource load ignored: ${url}`);
      });
    });

    // Capture browser console logs and page errors for CI debugging
    page.on("console", (msg) => {
      // Print all browser console messages with their type
      console.log(`BROWSER CONSOLE [${msg.type()}]:`, msg.text());
    });

    page.on("pageerror", (err) => {
      console.log("BROWSER PAGE ERROR:", err);
    });

    // Log responses from important API endpoints to ensure mocks are serving data
    page.on("response", async (response) => {
      const url = response.url();
      if (/\/v2\/(balances|staked|stakable-btc|rewards)/.test(url)) {
        console.log(`DEBUG: API RESP ${response.status()} ${url}`);
        try {
          const json = await response.json();
          console.log("DEBUG: API JSON", JSON.stringify(json));
        } catch {
          // non-JSON response
        }
      }
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

    // Verify some CSS is present (debug only, does not fail test)
    const cssPresent = await page.evaluate(() => {
      try {
        return Array.from(document.styleSheets).some((sheet) =>
          Boolean(
            sheet.href || (sheet.ownerNode && sheet.ownerNode.textContent),
          ),
        );
      } catch {
        return false;
      }
    });
    console.log("DEBUG: CSS present:", cssPresent);

    await setupWalletConnection(page);
  });

  test("balance is correct", async ({ page }) => {
    // Add diagnostic information before looking for elements
    console.log("DEBUG: Test started, URL =", page.url());
    console.log(
      "DEBUG: Document readyState =",
      await page.evaluate(() => document.readyState),
    );

    const spinnerSelector =
      '[data-testid="staked-balance"] .bbn-loader, [data-testid="stakable-balance"] .bbn-loader, [data-testid="baby-balance"] .bbn-loader, [data-testid="baby-rewards"] .bbn-loader';

    console.log("DEBUG: Waiting for spinners to disappear...");
    // Poll for the spinners to disappear to avoid strict mode violations when multiple remain.
    await page.waitForFunction(
      (sel) => document.querySelectorAll(sel).length === 0,
      spinnerSelector,
      { timeout: 30_000 },
    );
    console.log("DEBUG: Spinners disappeared successfully");

    // Wait specifically for the staked balance element to appear
    try {
      console.log("DEBUG: Looking for Staked Balance element...");
      await page.waitForSelector('.bbn-list-item:has-text("Staked Balance")', {
        timeout: 30000,
        state: "attached",
      });
      console.log("DEBUG: Staked Balance element found in DOM");
    } catch (error: unknown) {
      console.log(
        "DEBUG: Staked Balance element not found, error:",
        error instanceof Error ? error.message : String(error),
      );

      // Log the current HTML to see what's actually in the page
      console.log("DEBUG: Current page HTML:", await page.content());

      // Try reloading the page one last time
      console.log("DEBUG: Attempting final page reload");
      await page.reload({ waitUntil: "domcontentloaded" });
      await page.waitForLoadState("networkidle");
      await page.waitForTimeout(10000);
    }

    console.log("DEBUG: Finding balance elements...");
    const stakedBalance = page.locator(
      '.bbn-list-item:has-text("Staked Balance") .bbn-list-value',
    );

    // Check if stakedBalance exists and log its details
    const stakedBalanceCount = await stakedBalance.count();
    console.log(`DEBUG: Staked Balance elements found: ${stakedBalanceCount}`);

    let stakedBalanceText;
    try {
      stakedBalanceText = await stakedBalance.textContent();
      console.log("DEBUG: stakedBalanceText =", stakedBalanceText);
    } catch (error) {
      console.log("DEBUG: Failed to get staked balance text:", error);
      stakedBalanceText = "";
    }

    let stakableBalance;
    try {
      stakableBalance = await page
        .locator('.bbn-list-item:has-text("Stakable Balance") .bbn-list-value')
        .textContent();
      console.log("DEBUG: stakableBalance =", stakableBalance);
    } catch (error) {
      console.log("DEBUG: Failed to get stakable balance:", error);
      stakableBalance = "";
    }

    let babyBalance;
    try {
      babyBalance = await page
        .locator('.bbn-list-item:has-text("BABY Balance") .bbn-list-value')
        .textContent();
      console.log("DEBUG: babyBalance =", babyBalance);
    } catch (error) {
      console.log("DEBUG: Failed to get BABY balance:", error);
      babyBalance = "";
    }

    let babyRewards;
    try {
      babyRewards = await page
        .locator('.bbn-list-item:has-text("BABY Rewards") .bbn-list-value')
        .textContent();
      console.log("DEBUG: babyRewards =", babyRewards);
    } catch (error) {
      console.log("DEBUG: Failed to get BABY rewards:", error);
      babyRewards = "";
    }

    console.log(
      "DEBUG: VALUES!",
      stakedBalanceText,
      stakableBalance,
      babyBalance,
      babyRewards,
    );

    // Log the expected values for diagnostic purposes
    console.log("DEBUG: Expected staked balance: 0.09876543 BTC");
    console.log("DEBUG: Expected stakable balance: 0.00074175 BTC");
    console.log("DEBUG: Expected BABY balance: 1 BABY");
    console.log("DEBUG: Expected BABY rewards: 0.5 BABY");

    try {
      expect(stakedBalanceText).toContain("0.09876543 BTC");
      expect(stakableBalance).toContain("0.00074175 BTC");
      expect(babyBalance).toContain("1 BABY");
      expect(babyRewards).toContain("0.5 BABY");
    } catch (error) {
      console.log("DEBUG: Test assertions failed:", error);
      // Log more details about the page for debugging
      console.log("DEBUG: Final page URL =", page.url());
      throw error;
    }
  });
});
