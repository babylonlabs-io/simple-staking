import type { Page } from "@playwright/test";

import { injectBBNQueries } from "../mocks/blockchain";

export class PageNavigationActions {
  private page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async navigateToHomePage(page: Page) {
    await injectBBNQueries(page);
    await this.page.goto("/");
    await this.waitForPageLoad();
  }

  async waitForPageLoad() {
    await this.page.waitForLoadState("domcontentloaded");
    await this.page.waitForLoadState("networkidle");
  }
}
