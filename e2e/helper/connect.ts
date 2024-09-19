import { Page, expect } from "@playwright/test";

import {
  BUTTON_TEXT_BROWSER,
  BUTTON_TEXT_CONNECT_TO_BTC,
  LABEL_TEXT_ACCEPT_TERMS,
  LABEL_TEXT_HW_WALLET,
  LABEL_TEXT_NO_INSCRIPTIONS,
} from "../constants/text";

import { injectBTCWallet } from "./injectBTCWallet";

export const clickConnectButton = async (page: Page) => {
  const connectButton = page.getByRole("button", {
    name: BUTTON_TEXT_CONNECT_TO_BTC,
  });
  await connectButton.click();
};

export const acceptTermsAndConditions = async (page: Page) => {
  const termsCheckbox = page
    .locator("label")
    .filter({ hasText: LABEL_TEXT_ACCEPT_TERMS });

  const inscriptionsCheckbox = page
    .locator("label")
    .filter({ hasText: LABEL_TEXT_NO_INSCRIPTIONS });

  const hwCheckbox = page
    .locator("label")
    .filter({ hasText: LABEL_TEXT_HW_WALLET });

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
    .getByRole("button", { name: BUTTON_TEXT_BROWSER });
  await browserButton.click();
};

export const clickConnectWalletButton = async (page: Page) => {
  const connectWalletButton = page.getByTestId("modal").getByRole("button", {
    name: BUTTON_TEXT_CONNECT_TO_BTC,
  });
  await connectWalletButton.click();
};

export const setupWalletConnection = async (
  page: Page,
  network: string,
  walletType: string,
) => {
  // wallet injection should happen before page navigation
  await injectBTCWallet(page, network, walletType);
  await page.goto("/");
  // connect to the wallet
  await clickConnectButton(page);
  await acceptTermsAndConditions(page);
  await clickInjectableWalletButton(page);
  await clickConnectWalletButton(page);
};
