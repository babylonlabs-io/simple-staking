// e2e/helper/injectBBNWallet.ts
import { Page } from "@playwright/test";

export type BBNWalletType = "Keplr" | "Leap" | "Cosmostation";

// Sample BBN wallet implementation for E2E testing purposes
export const injectBBNWallet = async (
  page: Page,
  walletType: BBNWalletType = "Keplr",
) => {
  console.log(`Starting ${walletType} BBN wallet injection...`);
  try {
    // Inject the wallet methods into window.bbnwallet
    await page.evaluate((walletType) => {
      console.log(`Injecting ${walletType} BBN wallet into page...`);
      // Mock BBN wallet
      const bbnWallet = {
        connectWallet: () => {
          console.log(`Mock ${walletType} connectWallet called`);
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
              pubkey: new Uint8Array([1, 2, 3, 4, 5]), // Mock public key
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
        on: (event: string, callback: Function) => {
          console.log(`Registered BBN event listener for: ${event}`);
          return () =>
            console.log(`Unregistered BBN event listener for: ${event}`);
        },
        off: (event: string, callback: Function) => {
          console.log(`Removed BBN event listener for: ${event}`);
        },
      };

      window.bbnwallet = bbnWallet;

      // Also add wallet-specific global objects to mimic actual Cosmos wallets
      if (walletType === "Keplr") {
        // @ts-ignore - keplr is defined in the window for the test
        window.keplr = {
          enable: async (chainId: string) => {
            console.log(
              `Mock Keplr wallet enable called for chainId: ${chainId}`,
            );
            // The wallet connector expects this to return chainId, not addresses
            return true;
          },
          getOfflineSigner: () => bbnWallet.getOfflineSigner(),
          getKey: async (chainId: string) => {
            console.log(`Mock Keplr getKey called for chainId: ${chainId}`);
            return {
              name: "mock-keplr",
              algo: "secp256k1",
              pubKey: new Uint8Array([1, 2, 3, 4, 5]), // Mock public key
              address: new Uint8Array([1, 2, 3, 4, 5]), // Mock address
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
            console.log(
              `Mock Leap wallet enable called for chainId: ${chainId}`,
            );
            return true;
          },
          getOfflineSigner: () => bbnWallet.getOfflineSigner(),
        };
      } else if (walletType === "Cosmostation") {
        // @ts-ignore - cosmostation is defined in the window for the test
        window.cosmostation = {
          providers: {
            keplr: {
              enable: async (chainId: string) => {
                console.log(
                  `Mock Cosmostation wallet enable called for chainId: ${chainId}`,
                );
                return true;
              },
              getOfflineSigner: () => bbnWallet.getOfflineSigner(),
            },
          },
        };
      }

      console.log(`${walletType} BBN wallet successfully injected`);
    }, walletType);
    console.log(`${walletType} BBN wallet injection completed`);

    // Verify BBN wallet was properly injected
    const isBBNInjected = await verifyBBNWalletInjected(page);
    console.log(
      `BBN wallet injection verification: ${isBBNInjected ? "SUCCESS" : "FAILED"}`,
    );
    if (!isBBNInjected) {
      throw new Error("BBN wallet was not properly injected");
    }
  } catch (error) {
    console.error(`Error injecting ${walletType} BBN wallet:`, error);
    throw error;
  }
};

// Add a function to verify the wallet was injected
export const verifyBBNWalletInjected = async (page: Page): Promise<boolean> => {
  try {
    return await page.evaluate(() => {
      return Boolean(window.bbnwallet);
    });
  } catch (error) {
    console.error("Error verifying BBN wallet injection:", error);
    return false;
  }
};
