import type { Page } from "@playwright/test";

import {
  BABY_BALANCE_VALUE_SELECTOR,
  BABY_REWARDS_VALUE_SELECTOR,
  SPINNER_SELECTOR,
  STAKABLE_BALANCE_VALUE_SELECTOR,
  STAKED_BALANCE_ITEM_SELECTOR,
  STAKED_BALANCE_VALUE_SELECTOR,
} from "./wallet_balance.selectors";

export class WalletBalanceActions {
  private page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async waitForBalanceLoadingComplete() {
    await this.page.waitForFunction(
      (sel) => document.querySelectorAll(sel).length === 0,
      SPINNER_SELECTOR,
      { timeout: 30_000 },
    );

    try {
      await this.page.waitForSelector(STAKED_BALANCE_ITEM_SELECTOR, {
        timeout: 30000,
        state: "attached",
      });
    } catch (error: unknown) {
      await this.page.reload({ waitUntil: "domcontentloaded" });
      await this.page.waitForLoadState("networkidle");
      await this.page.waitForTimeout(10000);
    }
  }

  async getStakedBalance(): Promise<string | null> {
    const stakedBalance = this.page.locator(STAKED_BALANCE_VALUE_SELECTOR);
    return stakedBalance.textContent();
  }

  async getStakableBalance(): Promise<string | null> {
    return this.page.locator(STAKABLE_BALANCE_VALUE_SELECTOR).textContent();
  }

  async getBabyBalance(): Promise<string | null> {
    return this.page.locator(BABY_BALANCE_VALUE_SELECTOR).textContent();
  }

  async getBabyRewards(): Promise<string | null> {
    return this.page.locator(BABY_REWARDS_VALUE_SELECTOR).textContent();
  }
}
