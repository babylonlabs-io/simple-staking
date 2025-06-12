import type { Page } from "@playwright/test";

import mockData, { type MockData } from "./constants";
import type { BBNWalletType } from "./types";
import { verifyBBNWalletInjected } from "./verification";

type DataType = {
  walletType: BBNWalletType;
  mockData: MockData;
};

export const injectBBNWallet = async (
  page: Page,
  walletType: BBNWalletType = "Leap",
) => {
  try {
    await page.evaluate(
      (data: DataType) => {
        const { walletType, mockData } = data;
        const bbnData = mockData.bbnWallet;

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
                address: bbnData.walletAddress,
                algo: "secp256k1",
                pubkey: new Uint8Array(bbnData.pubkeyArray),
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
                signature: bbnData.signature,
              },
            }),
          }),
          getOfflineSignerAuto: async () => bbnWallet.getOfflineSigner(),
          getAddress: async () => bbnData.walletAddress,
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
                name: bbnData.walletNames.keplr,
                algo: "secp256k1",
                pubKey: new Uint8Array(bbnData.pubkeyArray),
                address: new Uint8Array(bbnData.pubkeyArray),
                bech32Address: bbnData.walletAddress,
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
                signature: bbnData.signature,
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
                name: bbnData.walletNames.leap,
                algo: "secp256k1",
                pubKey: new Uint8Array(bbnData.pubkeyArray),
                address: new Uint8Array(bbnData.pubkeyArray),
                bech32Address: bbnData.walletAddress,
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
      },
      { walletType, mockData },
    );

    // Verify BBN wallet was properly injected
    const isBBNInjected = await verifyBBNWalletInjected(page);
    if (!isBBNInjected) {
      throw new Error("BBN wallet was not properly injected");
    }
  } catch (error) {
    throw error;
  }
};
