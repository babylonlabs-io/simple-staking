import { Page } from "@playwright/test";

import { injectBBNQueries } from "../mocks/blockchain";

export class PageNavigationActions {
  constructor(private page: Page) {}

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
