import { Page } from "@playwright/test";

export class PageNavigationActions {
  constructor(private page: Page) {}

  async navigateToHomePage() {
    await this.page.goto("/");
    await this.waitForPageLoad();
  }

  async waitForPageLoad() {
    await this.page.waitForLoadState("domcontentloaded");
    await this.page.waitForLoadState("networkidle");
  }
}
