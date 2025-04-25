import { Page } from "@playwright/test";

export type BTCWalletType = "OKX" | "Unisat" | "OneKey" | "Keystone";

// Sample wallet implementation for E2E testing purposes
export const injectBTCWallet = async (
  page: Page,
  walletType: BTCWalletType = "OKX",
) => {
  console.log(`Starting ${walletType} BTC wallet injection...`);
  try {
    // Inject the wallet methods into window.btcwallet
    await page.evaluate((walletType) => {
      console.log(`Injecting ${walletType} BTC wallet into page...`);
      // wallet
      const btcWallet = {
        connectWallet: () => {
          console.log(`Mock ${walletType} connectWallet called`);
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
          return () => console.log(`Unregistered event listener for: ${event}`);
        },
        off: (event: string, callback: Function) => {
          console.log(`Removed event listener for: ${event}`);
        },
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
          console.log(`Mock ${walletType} signPsbt called`);
          return "70736274ff0100fd040102000000028a12de07985b7d06d83d9683eb3c0a86284fa3cbb2df998aed61009d700748ba0200000000fdffffff4ca53ae433b535b660a2dca99724199b2219a617508eed2ccf88762683a622430200000000fdffffff0350c3000000000000225120cf7c40c6fb1395430816dbb5e1ba9f172ef25573a3b609efa1723559cd82d5590000000000000000496a4762626234004c6e2954c75bcb53aa13b7cd5d8bcdb4c9a4dd0784d68b115bd4408813b45608094f5861be4128861d69ea4b66a5f974943f100f55400bf26f5cce124b4c9af7009604450000000000002251203a24123d844b4115ac87811ec3e9acfe8a307307a4d480f04bffcae35cb80f47340e0d000001012b50ba0000000000002251203a24123d844b4115ac87811ec3e9acfe8a307307a4d480f04bffcae35cb80f470108420140f94b4114bf4c77c449fefb45d60a86831a73897e58b03ba8250e1bf877912cdcc48d106fa266e8aa4085a43e9ad348652fb7b1ad0d820b6455c06edd92cadfef0001012b79510000000000002251203a24123d844b4115ac87811ec3e9acfe8a307307a4d480f04bffcae35cb80f470108420140e7abc0544c68c94a154e9136397ad8ab7d4dce0545c7c0db89aeb9a455e9377fb1c116ca20cdcb1c1ef4c9335a85c34499f45918ee37b010b69220626c4a8d7100000000";
        },
        pushTx: (_txHex: string) => {
          console.log(`Mock ${walletType} pushTx called`);
          return "47af61d63bcc6c513561d9a1198d082052cc07a81f50c6f130653f0a6ecc0fc1";
        },
      };

      window.btcwallet = btcWallet;

      // Also add wallet-specific global objects to mimic actual extensions
      if (walletType === "OKX") {
        // Use a type assertion for the entire object
        (window as any).okxwallet = {
          // Add all bitcoin network providers
          bitcoin: {
            ...btcWallet,
            isOKXWallet: true,
            // Add properties specifically required for Bitcoin support
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
              console.log(`Mock OKX bitcoin.signPsbt called with: ${psbtHex}`);
              return "signed_psbt_hex_string";
            },
            // Add connect method that OKXProvider calls
            connect: async () => {
              console.log("Mock OKX bitcoin.connect called");
              return {
                address:
                  "bc1p8gjpy0vyfdq3tty8sy0v86dvl69rquc85n2gpuztll9wxh9cpars7r97sd",
                compressedPublicKey:
                  "024c6e2954c75bcb53aa13b7cd5d8bcdb4c9a4dd0784d68b115bd4408813b45608",
              };
            },
            // Add getSelectedAddress method
            getSelectedAddress: () => {
              console.log("Mock OKX bitcoin.getSelectedAddress called");
              return "bc1p8gjpy0vyfdq3tty8sy0v86dvl69rquc85n2gpuztll9wxh9cpars7r97sd";
            },
            // Add any other potentially necessary methods
            getKey: () => ({
              publicKey:
                "024c6e2954c75bcb53aa13b7cd5d8bcdb4c9a4dd0784d68b115bd4408813b45608",
              address:
                "bc1p8gjpy0vyfdq3tty8sy0v86dvl69rquc85n2gpuztll9wxh9cpars7r97sd",
            }),
          },

          // Add testnet support
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
              console.log("Mock OKX bitcoinTestnet.connect called");
              return {
                address:
                  "tb1p8gjpy0vyfdq3tty8sy0v86dvl69rquc85n2gpuztll9wxh9cparslrnj4m",
                compressedPublicKey:
                  "024c6e2954c75bcb53aa13b7cd5d8bcdb4c9a4dd0784d68b115bd4408813b45608",
              };
            },
            getSelectedAddress: () => {
              console.log("Mock OKX bitcoinTestnet.getSelectedAddress called");
              return "tb1p8gjpy0vyfdq3tty8sy0v86dvl69rquc85n2gpuztll9wxh9cparslrnj4m";
            },
          },

          // Add signet support
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
              console.log("Mock OKX bitcoinSignet.connect called");
              return {
                address:
                  "tb1p8gjpy0vyfdq3tty8sy0v86dvl69rquc85n2gpuztll9wxh9cparslrnj4m",
                compressedPublicKey:
                  "024c6e2954c75bcb53aa13b7cd5d8bcdb4c9a4dd0784d68b115bd4408813b45608",
              };
            },
            getSelectedAddress: () => {
              console.log("Mock OKX bitcoinSignet.getSelectedAddress called");
              return "tb1p8gjpy0vyfdq3tty8sy0v86dvl69rquc85n2gpuztll9wxh9cparslrnj4m";
            },
          },

          // Add enable method required by the wallet connector
          enable: async (chain = "BTC") => {
            console.log(`Mock OKX wallet enable called for chain: ${chain}`);
            // Enable the wallet for connection
            if (chain === "BTC" || chain === "Bitcoin" || chain === "bitcoin") {
              // The wallet connector might expect an array of addresses OR just a boolean success indicator
              // Setting up the accounts to be retrieved by getAccounts/request methods
              return [
                "bc1p8gjpy0vyfdq3tty8sy0v86dvl69rquc85n2gpuztll9wxh9cpars7r97sd",
              ];
            }
            throw new Error(`Chain not supported: ${chain}`);
          },
          // Add additional methods that might be needed
          request: async (params: { method: string; params?: any }) => {
            console.log("Mock OKX wallet request called with params:", params);
            const { method, params: methodParams } = params;

            // Handle different request methods
            switch (method) {
              case "btc_getAccounts":
              case "btc_accounts":
                return [
                  "bc1p8gjpy0vyfdq3tty8sy0v86dvl69rquc85n2gpuztll9wxh9cpars7r97sd",
                ];
              case "btc_getNetwork":
              case "btc_networkVersion":
              case "wallet_getNetwork":
                return "mainnet";
              case "wallet_switchBitcoinNetwork":
                return true;
              case "btc_getBalance":
                return { confirmed: 12345678, unconfirmed: 0, total: 12345678 };
              case "btc_signPsbt":
                return methodParams?.psbt || "signed_psbt";
              default:
                console.log(
                  `Unhandled method in OKX wallet request: ${method}`,
                );
                return null;
            }
          },
          isConnected: () => true,
          // Indicate which networks are supported - this is explicitly required by some implementations
          supportedChains: ["BTC", "bitcoin", "Bitcoin"],
          // Check if a specific network is supported in the format expected by the connector
          hasChain: (chain: string) =>
            ["BTC", "bitcoin", "Bitcoin"].includes(chain),
          on: (event: string, handler: Function) => {
            console.log(`OKX wallet registered event handler for: ${event}`);
          },
          off: (event: string, handler: Function) => {
            console.log(`OKX wallet removed event handler for: ${event}`);
          },
          // Ensure these are set to show wallet is installed and ready
          isOKXWallet: true,
          version: "1.0.0",
        };
      } else if (walletType === "Unisat") {
        // @ts-ignore - unisat is defined in the window for the test
        window.unisat = {
          ...btcWallet,
          isUnisatWallet: true,
        };
      } else if (walletType === "OneKey") {
        window.$onekey = {
          bitcoin: {
            ...btcWallet,
            isOneKey: true,
          },
        };
      }

      console.log(`${walletType} BTC wallet successfully injected`);
    }, walletType);
    console.log(`${walletType} BTC wallet injection completed`);

    // Verify wallet was properly injected
    const isInjected = await verifyWalletInjected(page);
    console.log(
      `Wallet injection verification: ${isInjected ? "SUCCESS" : "FAILED"}`,
    );
    if (!isInjected) {
      throw new Error("BTC wallet was not properly injected");
    }
  } catch (error) {
    console.error(`Error injecting ${walletType} BTC wallet:`, error);
    throw error; // Re-throw to see the error in test results
  }
};

// Add a function to verify the wallet was injected
export const verifyWalletInjected = async (page: Page): Promise<boolean> => {
  try {
    return await page.evaluate(() => {
      return Boolean(window.btcwallet);
    });
  } catch (error) {
    console.error("Error verifying wallet injection:", error);
    return false;
  }
};
