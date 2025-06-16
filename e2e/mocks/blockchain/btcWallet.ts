import type { Page } from "@playwright/test";

import mockData, { type MockData } from "./constants";
import type { BTCWalletType } from "./types";
import { verifyBTCWalletInjected } from "./verification";

type DataType = {
  walletType: BTCWalletType;
  mockData: MockData;
};

export const injectBTCWallet = async (
  page: Page,
  walletType: BTCWalletType = "OKX",
) => {
  try {
    await page.evaluate(
      (data: DataType) => {
        const { walletType, mockData } = data;
        const btcData = mockData.btcWallet;

        const btcWallet = {
          connectWallet: () => {
            btcWallet.isConnected = true;
            return btcWallet;
          },
          isConnected: false,
          getWalletProviderName: () => walletType,
          getAddress: () => btcData.mainnetAddress,
          getPublicKeyHex: () => btcData.publicKeyHex,
          on: (event: string, callback: Function) => {
            return () => {};
          },
          off: (event: string, callback: Function) => {},
          getNetwork: () => "mainnet",
          getBTCTipHeight: () => btcData.tipHeight,
          getNetworkFees: () => btcData.networkFees,
          getInscriptions: () => [],
          signPsbt: (_psbtHex: string) => {
            return btcData.signedPsbt;
          },
          pushTx: (_txHex: string) => {
            return btcData.txHash;
          },
        };

        window.btcwallet = btcWallet;

        const walletStrategies: Record<string, () => void> = {
          OKX: () => {
            (window as any).okxwallet = {
              bitcoin: {
                ...btcWallet,
                isOKXWallet: true,
                getNetwork: () => "mainnet",
                getPublicKey: () => btcData.publicKeyHex,
                getBalance: () => btcData.balance,
                getAccounts: () => [btcData.mainnetAddress],
                isAccountActive: () => true,
                switchNetwork: (network: string) => Promise.resolve(true),
                signPsbt: (psbtHex: string) => {
                  return btcData.simplifiedPsbt;
                },
                connect: async () => {
                  return {
                    address: btcData.mainnetAddress,
                    compressedPublicKey: btcData.publicKeyHex,
                  };
                },
                getSelectedAddress: () => {
                  return btcData.mainnetAddress;
                },
                getKey: () => ({
                  publicKey: btcData.publicKeyHex,
                  address: btcData.mainnetAddress,
                }),
              },

              bitcoinTestnet: {
                ...btcWallet,
                isOKXWallet: true,
                getNetwork: () => "testnet",
                getPublicKey: () => btcData.publicKeyHex,
                getBalance: () => btcData.balance,
                getAccounts: () => [btcData.testnetAddress],
                connect: async () => {
                  return {
                    address: btcData.testnetAddress,
                    compressedPublicKey: btcData.publicKeyHex,
                  };
                },
                getSelectedAddress: () => {
                  return btcData.testnetAddress;
                },
              },

              bitcoinSignet: {
                ...btcWallet,
                isOKXWallet: true,
                getNetwork: () => "signet",
                getPublicKey: () => btcData.publicKeyHex,
                getBalance: () => btcData.balance,
                getAccounts: () => [btcData.testnetAddress],
                connect: async () => {
                  return {
                    address: btcData.testnetAddress,
                    compressedPublicKey: btcData.publicKeyHex,
                  };
                },
                getSelectedAddress: () => {
                  return btcData.testnetAddress;
                },
              },

              enable: async (chain = "BTC") => {
                if (
                  chain === "BTC" ||
                  chain === "Bitcoin" ||
                  chain === "bitcoin"
                ) {
                  return [btcData.mainnetAddress];
                }
                throw new Error(`Chain not supported: ${chain}`);
              },
              request: async (params: { method: string; params?: any }) => {
                const { method, params: methodParams } = params;

                switch (method) {
                  case "btc_getAccounts":
                  case "btc_accounts":
                    return [btcData.mainnetAddress];
                  case "btc_getNetwork":
                  case "btc_networkVersion":
                  case "wallet_getNetwork":
                    return "signet";
                  case "wallet_switchBitcoinNetwork":
                    return true;
                  case "btc_getBalance":
                    return btcData.balance;
                  case "btc_signPsbt":
                    return methodParams?.psbt || btcData.simplifiedPsbt;
                  default:
                    return null;
                }
              },
              isConnected: () => true,
              supportedChains: ["BTC", "bitcoin", "Bitcoin"],
              hasChain: (chain: string) =>
                ["BTC", "bitcoin", "Bitcoin"].includes(chain),
              on: (event: string, handler: Function) => {},
              off: (event: string, handler: Function) => {},
              isOKXWallet: true,
              version: "1.0.0",
            };
          },
          Unisat: () => {
            // @ts-ignore - unisat is defined in the window for the test
            window.unisat = {
              ...btcWallet,
              isUnisatWallet: true,
            };
          },
          OneKey: () => {
            window.$onekey = {
              bitcoin: {
                ...btcWallet,
                isOneKey: true,
              },
            };
          },
        };

        // Execute the appropriate strategy
        const strategy = walletStrategies[walletType];
        if (strategy) {
          strategy();
        }
      },
      { walletType, mockData },
    );

    const isInjected = await verifyBTCWalletInjected(page);
    if (!isInjected) {
      throw new Error("BTC wallet was not properly injected");
    }
  } catch (error) {
    throw error;
  }
};
