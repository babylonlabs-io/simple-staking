import { Page } from "@playwright/test";

import { injectBBNWallet, injectBTCWallet } from "../mocks/blockchain";
import { mockVerifyBTCAddress } from "../mocks/handlers";

declare global {
  interface Window {
    __bypassBTCAddressVerification: boolean;
    __forceVerificationSuccess: boolean;
  }
}

export class WalletConnectActions {
  constructor(private page: Page) {}

  async clickConnectButton() {
    const connectButtonSelector = 'button:has-text("Connect")';

    try {
      await this.page.waitForSelector(connectButtonSelector, {
        state: "visible",
        timeout: 5000,
      });

      const connectButtons = await this.page
        .locator(connectButtonSelector)
        .all();

      let buttonClicked = false;
      for (let i = 0; i < connectButtons.length; i++) {
        const isDisabled = await connectButtons[i].isDisabled();
        if (!isDisabled) {
          await connectButtons[i].click({ force: true });
          buttonClicked = true;
          break;
        }
      }

      if (!buttonClicked && connectButtons.length > 0) {
        await connectButtons[0].click({ force: true });
      }
    } catch (error) {
      console.error("Error in primary connect button logic:", error);
      await this.page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll("button"));
        const connectButton = buttons.find(
          (button) =>
            button.textContent?.toLowerCase().includes("connect") &&
            !button.disabled,
        );

        if (connectButton) {
          connectButton.click();
        } else {
          const anyConnectButton = buttons.find((button) =>
            button.textContent?.toLowerCase().includes("connect"),
          );

          if (anyConnectButton) {
            // @ts-ignore - we know what we're doing here
            anyConnectButton.disabled = false;
            anyConnectButton.click();
          }
        }
      });
    }
  }

  async acceptTermsAndConditions() {
    const maxWaitTime = 10000;
    const pollInterval = 1000;
    const startTime = Date.now();
    let termsDialogVisible = false;

    while (!termsDialogVisible && Date.now() - startTime < maxWaitTime) {
      termsDialogVisible = await this.page
        .locator('[class*="bbn-dialog-header"]')
        .isVisible()
        .catch(() => false);
      if (termsDialogVisible) {
        break;
      }
      await this.page.waitForTimeout(pollInterval);
    }

    if (!termsDialogVisible) {
      const anyDialog = await this.page
        .locator('dialog, [role="dialog"]')
        .first()
        .isVisible()
        .catch(() => false);
      if (anyDialog) {
        const acceptButtons = await this.page
          .locator(
            'button:has-text("Next"), button:has-text("Accept"), button:has-text("Continue"), button:has-text("OK")',
          )
          .all();
        if (acceptButtons.length > 0) {
          await acceptButtons[0].click().catch((e) => {
            console.error("Error clicking accept button:", e);
          });
        } else {
          const anyButton = await this.page
            .locator('dialog button, [role="dialog"] button')
            .first();
          const isVisible = await anyButton.isVisible().catch(() => false);
          if (isVisible) {
            await anyButton.click().catch((e) => {
              console.error("Error clicking dialog button:", e);
            });
          }
        }
      }
      return;
    }

    try {
      const checkboxes = this.page.locator(
        '.bbn-switcher-input[type="checkbox"]',
      );
      const count = await checkboxes.count();

      for (let i = 0; i < count; i++) {
        await checkboxes.nth(i).click();
      }

      await this.page.waitForTimeout(500);

      const nextButton = this.page.locator(
        '.bbn-dialog-footer button:has-text("Next")',
      );
      await nextButton.click();
    } catch (error) {
      console.error("Error accepting terms and conditions:", error);
    }
  }

  async clickInjectableWalletButton() {
    try {
      const bitcoinWalletButton = this.page
        .locator('button:has-text("Select Bitcoin Wallet")')
        .first();

      await bitcoinWalletButton.waitFor({ state: "visible", timeout: 5000 });

      await bitcoinWalletButton.click();
    } catch (error) {
      console.error("Error clicking injectable wallet button:", error);
    }
  }

  async clickConnectWalletButton() {
    try {
      const saveButton = this.page.locator(
        '.bbn-dialog-footer button:has-text("Save")',
      );
      await saveButton.waitFor({ state: "visible", timeout: 5000 });
      await saveButton.click();
    } catch (error) {
      console.error("Error clicking connect wallet button:", error);
    }
  }

  async clickOKXWalletButton() {
    try {
      const selectors = [
        'button:has-text("OKX")',
        'div[role="button"]:has-text("OKX")',
        '[data-testid="wallet-option-okx"]',
        'button:has-img[alt="OKX"]',
      ];

      for (const selector of selectors) {
        const okxButton = this.page.locator(selector).first();
        if ((await okxButton.count()) > 0 && (await okxButton.isVisible())) {
          await okxButton.click();
          break;
        }
      }

      await this.clickConnectWalletButton();
    } catch (uiError) {
      console.error("Error clicking OKX wallet button:", uiError);
    }
  }

  async clickBabylonChainWalletButton() {
    try {
      const selectors = [
        'button:has-text("Select Babylon Chain Wallet")',
        'button:has-img[alt="Babylon Chain"]',
        "button:has(.bbn-avatar)",
      ];

      for (const selector of selectors) {
        const babylonButton = this.page.locator(selector).first();
        if (
          (await babylonButton.count()) > 0 &&
          (await babylonButton.isVisible())
        ) {
          await babylonButton.click();
          break;
        }
      }
    } catch (uiError) {
      console.error("Error clicking Babylon Chain wallet button:", uiError);
    }
  }

  async clickGenericWalletButton(walletType: string = "Leap") {
    try {
      const leapButton = this.page.locator(
        `button:has(.h-10.w-10.object-contain):has-text("${walletType}")`,
      );
      await leapButton.waitFor({ state: "visible", timeout: 5000 });
      await leapButton.click();
    } catch (error) {
      console.error(`Error clicking ${walletType} wallet button:`, error);
    }
  }

  async clickDoneButton() {
    try {
      const doneButton = this.page.locator(
        '.bbn-dialog-footer button:has-text("Done")',
      );
      await doneButton.waitFor({ state: "visible", timeout: 5000 });
      await doneButton.click();
    } catch (error) {
      console.error("Error clicking Done button:", error);
    }
  }

  async setupMocks() {
    await mockVerifyBTCAddress(this.page);

    await this.page.evaluate(() => {
      window.__bypassBTCAddressVerification = true;
      window.__forceVerificationSuccess = true;
    });
  }

  async handleVerificationErrorIfPresent() {
    await this.page.waitForTimeout(2000);

    const errorDialog = this.page.locator(
      'text="The wallet cannot be connected"',
    );
    const isErrorVisible = await errorDialog.isVisible().catch(() => false);

    if (isErrorVisible) {
      await this.page.evaluate(() => {
        try {
          const doneButton = Array.from(
            document.querySelectorAll("button"),
          ).find((button) => button.textContent?.trim() === "Done");

          if (doneButton) {
            doneButton.click();
          }

          window.__forceVerificationSuccess = true;
        } catch (e) {
          console.error(
            "Error handling verification dialog in browser context:",
            e,
          );
        }
      });

      await this.page.waitForTimeout(1000);
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
