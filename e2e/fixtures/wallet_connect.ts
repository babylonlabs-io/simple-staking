import type { Page } from "@playwright/test";

import { injectBBNWallet, injectBTCWallet } from "../mocks/blockchain";
import { mockVerifyBTCAddress } from "../mocks/handlers";

import {
  BUTTON_SELECTORS,
  CHECKBOX_SELECTOR,
  CONNECT_BUTTON_SELECTOR,
  DIALOG_SELECTORS,
  WALLET_SELECTORS,
  createGenericWalletSelector,
} from "./wallet_connect.selectors";

export class WalletConnectActions {
  private page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async clickConnectButton() {
    await this.page.waitForSelector(CONNECT_BUTTON_SELECTOR, {
      state: "visible",
      timeout: 3000,
    });

    const connectButtons = await this.page
      .locator(CONNECT_BUTTON_SELECTOR)
      .all();

    for (const button of connectButtons) {
      const isDisabled = await button.isDisabled();
      if (!isDisabled) {
        await button.click({ force: true });
        return;
      }
    }

    if (connectButtons.length > 0) {
      await connectButtons[0].click({ force: true });
    }
  }

  async acceptTermsAndConditions() {
    await Promise.race([
      this.page
        .locator(DIALOG_SELECTORS.TERMS_DIALOG_HEADER)
        .waitFor({ state: "visible", timeout: 3000 })
        .catch(() => {}),
      this.page
        .locator(DIALOG_SELECTORS.ANY_DIALOG)
        .first()
        .waitFor({ state: "visible", timeout: 3000 })
        .catch(() => {}),
    ]);

    const termsDialogVisible = await this.page
      .locator(DIALOG_SELECTORS.TERMS_DIALOG_HEADER)
      .isVisible()
      .catch(() => false);

    if (!termsDialogVisible) {
      await this.handleAlternativeDialog();
      return;
    }

    const checkboxes = this.page.locator(CHECKBOX_SELECTOR);
    const count = await checkboxes.count();

    for (let i = 0; i < count; i++) {
      await checkboxes.nth(i).click();
    }

    await this.page.locator(BUTTON_SELECTORS.NEXT).click();
  }

  private async handleAlternativeDialog() {
    const anyDialog = await this.page
      .locator(DIALOG_SELECTORS.ANY_DIALOG)
      .first()
      .isVisible()
      .catch(() => false);

    if (!anyDialog) return;

    const buttonSelectorsList = [
      BUTTON_SELECTORS.NEXT,
      BUTTON_SELECTORS.ACCEPT,
      BUTTON_SELECTORS.CONTINUE,
      BUTTON_SELECTORS.OK,
    ];

    for (const selector of buttonSelectorsList) {
      const button = this.page.locator(selector).first();
      if (await button.isVisible().catch(() => false)) {
        await button
          .click()
          .catch((e) => console.error(`Error clicking ${selector}:`, e));
        return;
      }
    }

    const anyButton = this.page
      .locator(`${DIALOG_SELECTORS.ANY_DIALOG} button`)
      .first();
    if (await anyButton.isVisible().catch(() => false)) {
      await anyButton
        .click()
        .catch((e) => console.error("Error clicking dialog button:", e));
    }
  }

  async clickInjectableWalletButton() {
    const bitcoinWalletButton = this.page
      .locator(WALLET_SELECTORS.BITCOIN)
      .first();

    await bitcoinWalletButton.waitFor({ state: "visible", timeout: 10_000 });
    await bitcoinWalletButton.click();
  }

  async clickConnectWalletButton() {
    const saveButton = this.page.locator(BUTTON_SELECTORS.SAVE);
    await saveButton.waitFor({ state: "visible", timeout: 3000 });
    await saveButton.click();
  }

  async clickOKXWalletButton() {
    for (const selector of WALLET_SELECTORS.OKX) {
      const okxButton = this.page.locator(selector).first();
      if (await okxButton.isVisible().catch(() => false)) {
        await okxButton.click();
        break;
      }
    }

    await this.clickConnectWalletButton();
  }

  async clickBabylonChainWalletButton() {
    for (const selector of WALLET_SELECTORS.BABYLON) {
      const babylonButton = this.page.locator(selector).first();
      if (await babylonButton.isVisible().catch(() => false)) {
        await babylonButton.click();
        break;
      }
    }
  }

  async clickGenericWalletButton(walletType: string = "Leap") {
    const walletSelector = createGenericWalletSelector(walletType);
    const walletButton = this.page.locator(walletSelector);
    await walletButton.waitFor({ state: "visible", timeout: 3000 });
    await walletButton.click();
  }

  async clickDoneButton() {
    const doneButton = this.page.locator(BUTTON_SELECTORS.DONE);
    await doneButton.waitFor({ state: "visible", timeout: 3000 });
    await doneButton.click();
  }

  async setupMocks() {
    await mockVerifyBTCAddress(this.page);
  }

  async handleVerificationErrorIfPresent() {
    await this.page
      .locator(DIALOG_SELECTORS.ERROR_DIALOG)
      .waitFor({
        state: "visible",
        timeout: 1000,
      })
      .catch(() => {});

    const isErrorVisible = await this.page
      .locator(DIALOG_SELECTORS.ERROR_DIALOG)
      .isVisible()
      .catch(() => false);

    if (isErrorVisible) {
      const doneButton = this.page.locator(
        DIALOG_SELECTORS.ERROR_DIALOG_DONE_BUTTON,
      );

      if (await doneButton.isVisible().catch(() => false)) {
        await doneButton.click();

        await this.page
          .locator(DIALOG_SELECTORS.ERROR_DIALOG)
          .waitFor({
            state: "hidden",
            timeout: 1000,
          })
          .catch(() => {});
      }
    }
  }

  async setupWalletConnection() {
    await this.setupMocks();
    await injectBTCWallet(this.page);
    await injectBBNWallet(this.page);
    await this.clickConnectButton();
    await this.acceptTermsAndConditions();
    await this.clickInjectableWalletButton();
    await this.clickOKXWalletButton();
    await this.handleVerificationErrorIfPresent();
    await this.clickBabylonChainWalletButton();
    await this.clickGenericWalletButton();
    await this.clickDoneButton();
  }
}
