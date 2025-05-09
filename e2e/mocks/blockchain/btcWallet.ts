import { Page } from "@playwright/test";

import { BTCWalletType } from "./types";
import { verifyBTCWalletInjected } from "./verification";

export const injectBTCWallet = async (
  page: Page,
  walletType: BTCWalletType = "OKX",
) => {
  try {
    await page.evaluate((walletType) => {
      const btcWallet = {
        connectWallet: () => {
          btcWallet.isConnected = true;
          return btcWallet;
        },
        isConnected: false,
        getWalletProviderName: () => walletType,
        getAddress: () =>
          "bc1p8gjpy0vyfdq3tty8sy0v86dvl69rquc85n2gpuztll9wxh9cpars7r97sd",
        getPublicKeyHex: () =>
          "024c6e2954c75bcb53aa13b7cd5d8bcdb4c9a4dd0784d68b115bd4408813b45608",
        on: (event: string, callback: Function) => {
          return () => {};
        },
        off: (event: string, callback: Function) => {},
        getNetwork: () => "mainnet",
        getBTCTipHeight: () => 859568,
        getNetworkFees: () => ({
          fastestFee: 1,
          halfHourFee: 1,
          hourFee: 1,
          economyFee: 1,
          minimumFee: 1,
        }),
        getInscriptions: () => [],
        signPsbt: (_psbtHex: string) => {
          return "70736274ff0100fd040102000000028a12de07985b7d06d83d9683eb3c0a86284fa3cbb2df998aed61009d700748ba0200000000fdffffff4ca53ae433b535b660a2dca99724199b2219a617508eed2ccf88762683a622430200000000fdffffff0350c3000000000000225120cf7c40c6fb1395430816dbb5e1ba9f172ef25573a3b609efa1723559cd82d5590000000000000000496a4762626234004c6e2954c75bcb53aa13b7cd5d8bcdb4c9a4dd0784d68b115bd4408813b45608094f5861be4128861d69ea4b66a5f974943f100f55400bf26f5cce124b4c9af7009604450000000000002251203a24123d844b4115ac87811ec3e9acfe8a307307a4d480f04bffcae35cb80f47340e0d000001012b50ba0000000000002251203a24123d844b4115ac87811ec3e9acfe8a307307a4d480f04bffcae35cb80f470108420140f94b4114bf4c77c449fefb45d60a86831a73897e58b03ba8250e1bf877912cdcc48d106fa266e8aa4085a43e9ad348652fb7b1ad0d820b6455c06edd92cadfef00000000";
        },
        pushTx: (_txHex: string) => {
          return "47af61d63bcc6c513561d9a1198d082052cc07a81f50c6f130653f0a6ecc0fc1";
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
              getPublicKey: () =>
                "024c6e2954c75bcb53aa13b7cd5d8bcdb4c9a4dd0784d68b115bd4408813b45608",
              getBalance: () => ({
                confirmed: 12345678,
                unconfirmed: 0,
                total: 12345678,
              }),
              getAccounts: () => [
                "bc1p8gjpy0vyfdq3tty8sy0v86dvl69rquc85n2gpuztll9wxh9cpars7r97sd",
              ],
              isAccountActive: () => true,
              switchNetwork: (network: string) => Promise.resolve(true),
              signPsbt: (psbtHex: string) => {
                return "signed_psbt_hex_string";
              },
              connect: async () => {
                return {
                  address:
                    "bc1p8gjpy0vyfdq3tty8sy0v86dvl69rquc85n2gpuztll9wxh9cpars7r97sd",
                  compressedPublicKey:
                    "024c6e2954c75bcb53aa13b7cd5d8bcdb4c9a4dd0784d68b115bd4408813b45608",
                };
              },
              getSelectedAddress: () => {
                return "bc1p8gjpy0vyfdq3tty8sy0v86dvl69rquc85n2gpuztll9wxh9cpars7r97sd";
              },
              getKey: () => ({
                publicKey:
                  "024c6e2954c75bcb53aa13b7cd5d8bcdb4c9a4dd0784d68b115bd4408813b45608",
                address:
                  "bc1p8gjpy0vyfdq3tty8sy0v86dvl69rquc85n2gpuztll9wxh9cpars7r97sd",
              }),
            },

            bitcoinTestnet: {
              ...btcWallet,
              isOKXWallet: true,
              getNetwork: () => "testnet",
              getPublicKey: () =>
                "024c6e2954c75bcb53aa13b7cd5d8bcdb4c9a4dd0784d68b115bd4408813b45608",
              getBalance: () => ({
                confirmed: 12345678,
                unconfirmed: 0,
                total: 12345678,
              }),
              getAccounts: () => [
                "tb1p8gjpy0vyfdq3tty8sy0v86dvl69rquc85n2gpuztll9wxh9cparslrnj4m",
              ],
              connect: async () => {
                return {
                  address:
                    "tb1p8gjpy0vyfdq3tty8sy0v86dvl69rquc85n2gpuztll9wxh9cparslrnj4m",
                  compressedPublicKey:
                    "024c6e2954c75bcb53aa13b7cd5d8bcdb4c9a4dd0784d68b115bd4408813b45608",
                };
              },
              getSelectedAddress: () => {
                return "tb1p8gjpy0vyfdq3tty8sy0v86dvl69rquc85n2gpuztll9wxh9cparslrnj4m";
              },
            },

            bitcoinSignet: {
              ...btcWallet,
              isOKXWallet: true,
              getNetwork: () => "signet",
              getPublicKey: () =>
                "024c6e2954c75bcb53aa13b7cd5d8bcdb4c9a4dd0784d68b115bd4408813b45608",
              getBalance: () => ({
                confirmed: 12345678,
                unconfirmed: 0,
                total: 12345678,
              }),
              getAccounts: () => [
                "tb1p8gjpy0vyfdq3tty8sy0v86dvl69rquc85n2gpuztll9wxh9cparslrnj4m",
              ],
              connect: async () => {
                return {
                  address:
                    "tb1p8gjpy0vyfdq3tty8sy0v86dvl69rquc85n2gpuztll9wxh9cparslrnj4m",
                  compressedPublicKey:
                    "024c6e2954c75bcb53aa13b7cd5d8bcdb4c9a4dd0784d68b115bd4408813b45608",
                };
              },
              getSelectedAddress: () => {
                return "tb1p8gjpy0vyfdq3tty8sy0v86dvl69rquc85n2gpuztll9wxh9cparslrnj4m";
              },
            },

            enable: async (chain = "BTC") => {
              if (
                chain === "BTC" ||
                chain === "Bitcoin" ||
                chain === "bitcoin"
              ) {
                return [
                  "bc1p8gjpy0vyfdq3tty8sy0v86dvl69rquc85n2gpuztll9wxh9cpars7r97sd",
                ];
              }
              throw new Error(`Chain not supported: ${chain}`);
            },
            request: async (params: { method: string; params?: any }) => {
              const { method, params: methodParams } = params;

              switch (method) {
                case "btc_getAccounts":
                case "btc_accounts":
                  return [
                    "bc1p8gjpy0vyfdq3tty8sy0v86dvl69rquc85n2gpuztll9wxh9cpars7r97sd",
                  ];
                case "btc_getNetwork":
                case "btc_networkVersion":
                case "wallet_getNetwork":
                  return "signet";
                case "wallet_switchBitcoinNetwork":
                  return true;
                case "btc_getBalance":
                  return {
                    confirmed: 12345678,
                    unconfirmed: 0,
                    total: 12345678,
                  };
                case "btc_signPsbt":
                  return methodParams?.psbt || "signed_psbt";
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
    }, walletType);

    const isInjected = await verifyBTCWalletInjected(page);
    if (!isInjected) {
      throw new Error("BTC wallet was not properly injected");
    }
  } catch (error) {
    throw error;
  }
};
