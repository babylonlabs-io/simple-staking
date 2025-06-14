import type { Page } from "@playwright/test";

export const verifyBTCWalletInjected = async (page: Page): Promise<boolean> => {
  try {
    return await page.evaluate(() => {
      return Boolean(window.btcwallet);
    });
  } catch (error) {
    return false;
  }
};

export const verifyBBNWalletInjected = async (page: Page): Promise<boolean> => {
  try {
    return await page.evaluate(() => {
      return Boolean(window.bbnwallet);
    });
  } catch (error) {
    return false;
  }
};
