import { Page } from "@playwright/test";

import { injectBBNWallet, injectBTCWallet } from "../mocks/blockchain";
import { mockVerifyBTCAddress } from "../mocks/handlers";

import {
  buttonSelectors,
  checkboxSelector,
  connectButtonSelector,
  createGenericWalletSelector,
  dialogSelectors,
  walletSelectors,
} from "./wallet_connect.selectors";

export class WalletConnectActions {
  constructor(private page: Page) {}

  async clickConnectButton() {
    try {
      await this.page.waitForSelector(connectButtonSelector, {
        state: "visible",
        timeout: 3000,
      });

      const connectButtons = await this.page
        .locator(connectButtonSelector)
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
    } catch (error) {
      console.error("Error clicking connect button:", error);
    }
  }

  async acceptTermsAndConditions() {
    try {
      await Promise.race([
        this.page
          .locator(dialogSelectors.termsDialogHeader)
          .waitFor({ state: "visible", timeout: 3000 })
          .catch(() => {}),
        this.page
          .locator(dialogSelectors.anyDialog)
          .first()
          .waitFor({ state: "visible", timeout: 3000 })
          .catch(() => {}),
      ]);

      const termsDialogVisible = await this.page
        .locator(dialogSelectors.termsDialogHeader)
        .isVisible()
        .catch(() => false);

      if (!termsDialogVisible) {
        await this.handleAlternativeDialog();
        return;
      }

      const checkboxes = this.page.locator(checkboxSelector);
      const count = await checkboxes.count();

      for (let i = 0; i < count; i++) {
        await checkboxes.nth(i).click();
      }

      await this.page.locator(buttonSelectors.next).click();
    } catch (error) {
      console.error("Error accepting terms and conditions:", error);
    }
  }

  private async handleAlternativeDialog() {
    const anyDialog = await this.page
      .locator(dialogSelectors.anyDialog)
      .first()
      .isVisible()
      .catch(() => false);

    if (!anyDialog) return;

    const buttonSelectorsList = [
      buttonSelectors.next,
      buttonSelectors.accept,
      buttonSelectors.continue,
      buttonSelectors.ok,
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
      .locator(`${dialogSelectors.anyDialog} button`)
      .first();
    if (await anyButton.isVisible().catch(() => false)) {
      await anyButton
        .click()
        .catch((e) => console.error("Error clicking dialog button:", e));
    }
  }

  async clickInjectableWalletButton() {
    try {
      const bitcoinWalletButton = this.page
        .locator(walletSelectors.bitcoin)
        .first();

      await bitcoinWalletButton.waitFor({ state: "visible", timeout: 3000 });
      await bitcoinWalletButton.click();
    } catch (error) {
      console.error("Error clicking injectable wallet button:", error);
    }
  }

  async clickConnectWalletButton() {
    try {
      const saveButton = this.page.locator(buttonSelectors.save);
      await saveButton.waitFor({ state: "visible", timeout: 3000 });
      await saveButton.click();
    } catch (error) {
      console.error("Error clicking connect wallet button:", error);
    }
  }

  async clickOKXWalletButton() {
    try {
      for (const selector of walletSelectors.okx) {
        const okxButton = this.page.locator(selector).first();
        if (await okxButton.isVisible().catch(() => false)) {
          await okxButton.click();
          break;
        }
      }

      await this.clickConnectWalletButton();
    } catch (error) {
      console.error("Error clicking OKX wallet button:", error);
    }
  }

  async clickBabylonChainWalletButton() {
    try {
      for (const selector of walletSelectors.babylon) {
        const babylonButton = this.page.locator(selector).first();
        if (await babylonButton.isVisible().catch(() => false)) {
          await babylonButton.click();
          break;
        }
      }
    } catch (error) {
      console.error("Error clicking Babylon Chain wallet button:", error);
    }
  }

  async clickGenericWalletButton(walletType: string = "Leap") {
    try {
      const walletSelector = createGenericWalletSelector(walletType);
      const walletButton = this.page.locator(walletSelector);
      await walletButton.waitFor({ state: "visible", timeout: 3000 });
      await walletButton.click();
    } catch (error) {
      console.error(`Error clicking ${walletType} wallet button:`, error);
    }
  }

  async clickDoneButton() {
    try {
      const doneButton = this.page.locator(buttonSelectors.done);
      await doneButton.waitFor({ state: "visible", timeout: 3000 });
      await doneButton.click();
    } catch (error) {
      console.error("Error clicking Done button:", error);
    }
  }

  async setupMocks() {
    await mockVerifyBTCAddress(this.page);
  }

  async handleVerificationErrorIfPresent() {
    try {
      await this.page
        .locator(dialogSelectors.errorDialog)
        .waitFor({
          state: "visible",
          timeout: 1000,
        })
        .catch(() => {});

      const isErrorVisible = await this.page
        .locator(dialogSelectors.errorDialog)
        .isVisible()
        .catch(() => false);

      if (isErrorVisible) {
        const doneButton = this.page.locator(
          dialogSelectors.errorDialogDoneButton,
        );

        if (await doneButton.isVisible().catch(() => false)) {
          await doneButton.click();

          await this.page
            .locator(dialogSelectors.errorDialog)
            .waitFor({
              state: "hidden",
              timeout: 1000,
            })
            .catch(() => {});
        }
      }
    } catch (error) {
      console.error("Error handling verification error:", error);
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
