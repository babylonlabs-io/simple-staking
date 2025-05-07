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
    await page.route("**/*", async (route) => {
      const url = route.request().url();

      // Intercept and stub healthcheck to avoid geo-blocking in CI.
      if (url.includes("/healthcheck")) {
        return route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ data: "ok" }),
        });
      }
      if (url.includes("/address/screening")) {
        return route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            data: { btc_address: { risk: "low" } },
          }),
        });
      }

      // Always allow main document.
      if (route.request().resourceType() === "document") {
        return route.continue();
      }

      // Continue other resources; log failures.
      route.continue().catch(() => {});
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
        try {
          await response.json();
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

    // Wait for the document to be fully loaded
    await page.waitForLoadState("domcontentloaded");

    await page.waitForLoadState("networkidle");

    // Verify some CSS is present (debug only, does not fail test)
    await page.evaluate(() => {
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

    await setupWalletConnection(page);
  });

  test("balance is correct", async ({ page }) => {
    const spinnerSelector =
      '[data-testid="staked-balance"] .bbn-loader, [data-testid="stakable-balance"] .bbn-loader, [data-testid="baby-balance"] .bbn-loader, [data-testid="baby-rewards"] .bbn-loader';

    // Poll for the spinners to disappear to avoid strict mode violations when multiple remain.
    await page.waitForFunction(
      (sel) => document.querySelectorAll(sel).length === 0,
      spinnerSelector,
      { timeout: 30_000 },
    );

    // Wait specifically for the staked balance element to appear
    try {
      await page.waitForSelector('.bbn-list-item:has-text("Staked Balance")', {
        timeout: 30000,
        state: "attached",
      });
    } catch (error: unknown) {
      // Try reloading the page one last time
      await page.reload({ waitUntil: "domcontentloaded" });
      await page.waitForLoadState("networkidle");
      await page.waitForTimeout(10000);
    }

    const stakedBalance = page.locator(
      '.bbn-list-item:has-text("Staked Balance") .bbn-list-value',
    );

    // Check if stakedBalance exists and log its details
    const stakedBalanceCount = await stakedBalance.count();

    let stakedBalanceText;
    try {
      stakedBalanceText = await stakedBalance.textContent();
    } catch (error) {
      stakedBalanceText = "";
    }

    let stakableBalance;
    try {
      stakableBalance = await page
        .locator('.bbn-list-item:has-text("Stakable Balance") .bbn-list-value')
        .textContent();
    } catch (error) {
      stakableBalance = "";
    }

    let babyBalance;
    try {
      babyBalance = await page
        .locator('.bbn-list-item:has-text("BABY Balance") .bbn-list-value')
        .textContent();
    } catch (error) {
      babyBalance = "";
    }

    let babyRewards;
    try {
      babyRewards = await page
        .locator('.bbn-list-item:has-text("BABY Rewards") .bbn-list-value')
        .textContent();
    } catch (error) {
      babyRewards = "";
    }

    try {
      expect(stakedBalanceText).toContain("0.09876543 BTC");
      expect(stakableBalance).toContain("0.00074175 BTC");
      expect(babyBalance).toContain("1 BABY");
      expect(babyRewards).toContain("0.5 BABY");
    } catch (error) {
      throw error;
    }
  });
});
