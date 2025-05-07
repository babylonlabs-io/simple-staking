import { Page } from "@playwright/test";

import { BBNWalletType } from "./types";
import { verifyBBNWalletInjected } from "./verification";

export const injectBBNWallet = async (
  page: Page,
  walletType: BBNWalletType = "Leap",
) => {
  try {
    await page.evaluate((walletType) => {
      const bbnWallet = {
        connectWallet: () => {
          bbnWallet.isConnected = true;
          return bbnWallet;
        },
        isConnected: false,
        getWalletProviderName: () => walletType,
        getOfflineSigner: () => ({
          getAccounts: async () => [
            {
              address: "bbn1qpzxvj2vty4smkhkn4fjkvst0kv8zgxjumz4u0",
              algo: "secp256k1",
              pubkey: new Uint8Array([1, 2, 3, 4, 5]),
            },
          ],
          signDirect: async () => ({
            signed: {
              bodyBytes: new Uint8Array([]),
              authInfoBytes: new Uint8Array([]),
              chainId: "",
              accountNumber: 0,
            },
            signature: {
              signature: "signature",
            },
          }),
        }),
        getOfflineSignerAuto: async () => bbnWallet.getOfflineSigner(),
        getAddress: async () => "bbn1qpzxvj2vty4smkhkn4fjkvst0kv8zgxjumz4u0",
        on: (event: string, callback: Function) => {
          return () => {};
        },
        off: (event: string, callback: Function) => {},
      };

      window.bbnwallet = bbnWallet;

      if (walletType === "Keplr") {
        // @ts-ignore - keplr is defined in the window for the test
        (window as any).keplr = {
          enable: async (chainId: string) => {
            return true;
          },
          getOfflineSigner: () => bbnWallet.getOfflineSigner(),
          getKey: async (chainId: string) => {
            return {
              name: "mock-keplr",
              algo: "secp256k1",
              pubKey: new Uint8Array([1, 2, 3, 4, 5]),
              address: new Uint8Array([1, 2, 3, 4, 5]),
              bech32Address: "bbn1qpzxvj2vty4smkhkn4fjkvst0kv8zgxjumz4u0",
            };
          },
          signDirect: async () => ({
            signed: {
              bodyBytes: new Uint8Array([]),
              authInfoBytes: new Uint8Array([]),
              chainId: "",
              accountNumber: 0,
            },
            signature: {
              signature: "signature",
            },
          }),
        };
      } else if (walletType === "Leap") {
        // @ts-ignore - leap is defined in the window for the test
        window.leap = {
          enable: async (chainId: string) => {
            return true;
          },
          getOfflineSigner: () => bbnWallet.getOfflineSigner(),
          getKey: async (chainId: string) => {
            return {
              name: "mock-leap",
              algo: "secp256k1",
              pubKey: new Uint8Array([1, 2, 3, 4, 5]),
              address: new Uint8Array([1, 2, 3, 4, 5]),
              bech32Address: "bbn1qpzxvj2vty4smkhkn4fjkvst0kv8zgxjumz4u0",
            };
          },
        };
      } else if (walletType === "Cosmostation") {
        // @ts-ignore - cosmostation is defined in the window for the test
        window.cosmostation = {
          providers: {
            keplr: {
              enable: async (chainId: string) => {
                return true;
              },
              getOfflineSigner: () => bbnWallet.getOfflineSigner(),
            },
          },
        };
      }
    }, walletType);

    // Verify BBN wallet was properly injected
    const isBBNInjected = await verifyBBNWalletInjected(page);
    if (!isBBNInjected) {
      throw new Error("BBN wallet was not properly injected");
    }
  } catch (error) {
    throw error;
  }
};
