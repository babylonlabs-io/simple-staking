import { Page } from "@playwright/test";

export class WalletBalanceActions {
  constructor(private page: Page) {}

  async waitForBalanceLoadingComplete() {
    const spinnerSelector =
      '[data-testid="staked-balance"] .bbn-loader, [data-testid="stakable-balance"] .bbn-loader, [data-testid="baby-balance"] .bbn-loader, [data-testid="baby-rewards"] .bbn-loader';

    await this.page.waitForFunction(
      (sel) => document.querySelectorAll(sel).length === 0,
      spinnerSelector,
      { timeout: 30_000 },
    );

    try {
      await this.page.waitForSelector(
        '.bbn-list-item:has-text("Staked Balance")',
        {
          timeout: 30000,
          state: "attached",
        },
      );
    } catch (error: unknown) {
      await this.page.reload({ waitUntil: "domcontentloaded" });
      await this.page.waitForLoadState("networkidle");
      await this.page.waitForTimeout(10000);
    }
  }

  async getStakedBalance(): Promise<string | null> {
    const stakedBalance = this.page.locator(
      '.bbn-list-item:has-text("Staked Balance") .bbn-list-value',
    );
    return stakedBalance.textContent();
  }

  async getStakableBalance(): Promise<string | null> {
    return this.page
      .locator('.bbn-list-item:has-text("Stakable Balance") .bbn-list-value')
      .textContent();
  }

  async getBabyBalance(): Promise<string | null> {
    return this.page
      .locator('.bbn-list-item:has-text("BABY Balance") .bbn-list-value')
      .textContent();
  }

  async getBabyRewards(): Promise<string | null> {
    return this.page
      .locator('.bbn-list-item:has-text("BABY Rewards") .bbn-list-value')
      .textContent();
  }
}
