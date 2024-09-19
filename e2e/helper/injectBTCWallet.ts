import { NodeGlobalsPolyfillPlugin } from "@esbuild-plugins/node-globals-polyfill";
import { NodeModulesPolyfillPlugin } from "@esbuild-plugins/node-modules-polyfill";
import { Page } from "@playwright/test";
import { build } from "esbuild";
import path from "path";

import { MNEMONIC } from "../constants/wallet";

export const injectBTCWallet = async (
  page: Page,
  network: string = "mainnet",
  walletType: string = "taproot",
) => {
  try {
    const walletPath = path.resolve(__dirname, "btcWallet.ts");

    const result = await build({
      entryPoints: [walletPath],
      bundle: true,
      write: false,
      format: "iife",
      globalName: "btcWalletModule",
      platform: "browser",
      sourcemap: false,
      target: ["chrome58", "firefox57", "safari11"],
      loader: { ".ts": "ts" },
      plugins: [
        NodeGlobalsPolyfillPlugin({
          buffer: true,
          process: true,
        }),
        NodeModulesPolyfillPlugin(),
      ],
      define: {
        "process.env.NODE_ENV": '"production"',
        "process.env.NEXT_PUBLIC_NETWORK": JSON.stringify(network),
        "process.env.NEXT_PUBLIC_MEMPOOL_API": JSON.stringify(
          process.env.NEXT_PUBLIC_MEMPOOL_API,
        ),
        "process.env.NEXT_PUBLIC_DISPLAY_TESTING_MESSAGES": JSON.stringify(
          process.env.NEXT_PUBLIC_DISPLAY_TESTING_MESSAGES,
        ),
        "process.env.NEXT_PUBLIC_API_URL": JSON.stringify(
          process.env.NEXT_PUBLIC_API_URL,
        ),
        global: "window",
      },
    });

    const btcWalletCode = result.outputFiles[0].text;

    const scriptContent = `
      (() => {
        ${btcWalletCode}
        const mnemonic = '${MNEMONIC}';
        const network = '${network}';
        const walletType = '${walletType}';

        window.btcwallet = new btcWalletModule.BTCWallet(mnemonic, network, walletType);
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
