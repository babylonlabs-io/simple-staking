import { Page } from "@playwright/test";
import fs from "fs";
import path from "path";

import { MNEMONIC } from "../constants/wallet";

export const injectBTCWallet = async (
  page: Page,
  network: string = "mainnet",
  address: string = "taproot",
) => {
  try {
    const bundleFilename = `btcWallet.${network}.bundle.js`;
    const bundlePath = path.resolve(__dirname, "../../dist", bundleFilename);
    const btcWalletCode = fs.readFileSync(bundlePath, "utf8");

    const scriptContent = `
      (() => {
        ${btcWalletCode}
        const mnemonic = '${MNEMONIC}';
        const network = '${network}';
        const addressType = '${address}';

        window.btcwallet = new btcWalletModule.BTCWallet(mnemonic, network, addressType);
      })();
    `;

    await page.addInitScript({
      content: scriptContent,
    });
  } catch (error) {
    console.error("Error injecting BTC Wallet:", error);
    throw error;
  }
};
