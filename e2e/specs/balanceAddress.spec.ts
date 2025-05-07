import { expect, test } from "@playwright/test";

import { WalletConnectActions } from "../middleware/connect";
import { injectBBNQueries } from "../mocks/blockchain";
import { mockVerifyBTCAddress } from "../mocks/handlers";

test.describe("Balance and address checks after connection", () => {
  let actions: WalletConnectActions;

  test.beforeEach(async ({ page }) => {
    await page.route("**/*", async (route) => {
      const url = route.request().url();

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

      if (route.request().resourceType() === "document") {
        return route.continue();
      }

      route.continue().catch(() => {});
    });

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

    await mockVerifyBTCAddress(page);

    await injectBBNQueries(page);

    await page.goto("/");

    await page.waitForLoadState("domcontentloaded");

    await page.waitForLoadState("networkidle");

    actions = new WalletConnectActions(page);
    await actions.setupWalletConnection();
  });

  test("balance is correct", async ({ page }) => {
    const spinnerSelector =
      '[data-testid="staked-balance"] .bbn-loader, [data-testid="stakable-balance"] .bbn-loader, [data-testid="baby-balance"] .bbn-loader, [data-testid="baby-rewards"] .bbn-loader';

    await page.waitForFunction(
      (sel) => document.querySelectorAll(sel).length === 0,
      spinnerSelector,
      { timeout: 30_000 },
    );

    try {
      await page.waitForSelector('.bbn-list-item:has-text("Staked Balance")', {
        timeout: 30000,
        state: "attached",
      });
    } catch (error: unknown) {
      await page.reload({ waitUntil: "domcontentloaded" });
      await page.waitForLoadState("networkidle");
      await page.waitForTimeout(10000);
    }

    const stakedBalance = page.locator(
      '.bbn-list-item:has-text("Staked Balance") .bbn-list-value',
    );

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
