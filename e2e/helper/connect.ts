import { Page, expect } from "@playwright/test";

import { injectBTCWallet } from "./injectBTCWallet";

export const clickConnectButton = async (page: Page) => {
  const connectButton = page.getByRole("button", {
    name: "Connect to BTC",
  });
  await connectButton.click();
};

export const acceptTermsAndConditions = async (page: Page) => {
  const termsCheckbox = page
    .locator("label")
    .filter({ hasText: "I certify that I have read" });

  const inscriptionsCheckbox = page
    .locator("label")
    .filter({ hasText: "I certify that there are no" });

  const hwCheckbox = page
    .locator("label")
    .filter({ hasText: "I acknowledge that Keystone via QR code" });

  await termsCheckbox.click();
  await inscriptionsCheckbox.click();
  await hwCheckbox.click();

  expect(await termsCheckbox.isChecked()).toBe(true);
  expect(await inscriptionsCheckbox.isChecked()).toBe(true);
  expect(await hwCheckbox.isChecked()).toBe(true);
};

export const clickInjectableWalletButton = async (page: Page) => {
  const browserButton = page
    .getByTestId("modal")
    .getByRole("button", { name: "Browser" });
  await browserButton.click();
};

export const clickConnectWalletButton = async (page: Page) => {
  const connectWalletButton = page.getByTestId("modal").getByRole("button", {
    name: "Connect to BTC network",
  });
  await connectWalletButton.click();
};

export const setupWalletConnection = async (page: Page) => {
  await injectBTCWallet(page);
  await clickConnectButton(page);
  await acceptTermsAndConditions(page);
  await clickInjectableWalletButton(page);
  await clickConnectWalletButton(page);
};
