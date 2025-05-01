import { Page } from "@playwright/test";

// BBN Wallet Types
export type BBNWalletType = "Keplr" | "Leap" | "Cosmostation";

// BTC Wallet Types
export type BTCWalletType = "OKX" | "Unisat" | "OneKey" | "Keystone";

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
        // Provide getOfflineSignerAuto for compatibility
        getOfflineSignerAuto: async () => bbnWallet.getOfflineSigner(),
        // Provide getAddress used by Babylon connector
        getAddress: async () => "bbn1qpzxvj2vty4smkhkn4fjkvst0kv8zgxjumz4u0",
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

// Sample BTC wallet implementation for E2E testing purposes
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
          return "70736274ff0100fd040102000000028a12de07985b7d06d83d9683eb3c0a86284fa3cbb2df998aed61009d700748ba0200000000fdffffff4ca53ae433b535b660a2dca99724199b2219a617508eed2ccf88762683a622430200000000fdffffff0350c3000000000000225120cf7c40c6fb1395430816dbb5e1ba9f172ef25573a3b609efa1723559cd82d5590000000000000000496a4762626234004c6e2954c75bcb53aa13b7cd5d8bcdb4c9a4dd0784d68b115bd4408813b45608094f5861be4128861d69ea4b66a5f974943f100f55400bf26f5cce124b4c9af7009604450000000000002251203a24123d844b4115ac87811ec3e9acfe8a307307a4d480f04bffcae35cb80f47340e0d000001012b50ba0000000000002251203a24123d844b4115ac87811ec3e9acfe8a307307a4d480f04bffcae35cb80f470108420140f94b4114bf4c77c449fefb45d60a86831a73897e58b03ba8250e1bf877912cdcc48d106fa266e8aa4085a43e9ad348652fb7b1ad0d820b6455c06edd92cadfef00000000";
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
    const isInjected = await verifyBTCWalletInjected(page);
    console.log(
      `Wallet injection verification: ${isInjected ? "SUCCESS" : "FAILED"}`,
    );
    if (!isInjected) {
      throw new Error("BTC wallet was not properly injected");
    }
  } catch (error) {
    console.error(`Error injecting ${walletType} BTC wallet:`, error);
    throw error;
  }
};

const verifyBTCWalletInjected = async (page: Page): Promise<boolean> => {
  try {
    return await page.evaluate(() => {
      return Boolean(window.btcwallet);
    });
  } catch (error) {
    console.error("Error verifying BTC wallet injection:", error);
    return false;
  }
};

const verifyBBNWalletInjected = async (page: Page): Promise<boolean> => {
  try {
    return await page.evaluate(() => {
      return Boolean(window.bbnwallet);
    });
  } catch (error) {
    console.error("Error verifying BBN wallet injection:", error);
    return false;
  }
};

// Mock BBN RPC query functions used in E2E tests
export const injectBBNQueries = async (
  page: Page,
  rewardAmount: string = "500000",
) => {
  console.log("Injecting BBN query mocks...");

  // Precompute encoded protobuf responses in Node (outside browser)
  const { incentivequery } = require("@babylonlabs-io/babylon-proto-ts");
  const {
    QueryBalanceResponse,
  } = require("cosmjs-types/cosmos/bank/v1beta1/query");

  const rewardGaugeProto = incentivequery.QueryRewardGaugesResponse.fromPartial(
    {
      rewardGauges: {
        BTC_STAKER: {
          coins: [{ amount: rewardAmount, denom: "ubbn" }],
          withdrawnCoins: [],
        },
      },
    },
  );

  const rewardGaugeBase64 = Buffer.from(
    incentivequery.QueryRewardGaugesResponse.encode(rewardGaugeProto).finish(),
  ).toString("base64");

  console.log(
    "[E2E] Prepared rewardGaugeBase64",
    rewardGaugeBase64.slice(0, 20),
    "... len",
    rewardGaugeBase64.length,
  );

  // Build and pre-encode correct bank balance response (1 000 000 ubbn)
  const balanceProto = QueryBalanceResponse.fromPartial({
    balance: { denom: "ubbn", amount: "1000000" },
  });

  const balanceBase64: string = Buffer.from(
    QueryBalanceResponse.encode(balanceProto).finish(),
  ).toString("base64");

  // Sanity-check decode at build time (throws if malformed)
  QueryBalanceResponse.decode(Buffer.from(balanceBase64, "base64"));

  await page.addInitScript((amount) => {
    // Enable E2E test mode so the application uses the mocked queries
    window.__e2eTestMode = true;

    // Mock the bank balance query
    window.mockCosmJSBankBalance = (address) => {
      console.log(`Mock CosmJS bank balance query for address: ${address}`);
      return Promise.resolve({
        amount: "1000000",
        denom: "ubbn",
      });
    };

    // Mock the rewards gauge query with a configurable amount
    window.mockCosmJSRewardsQuery = (address) => {
      console.log(`Mock CosmJS rewards query for address: ${address}`);
      return Promise.resolve({
        rewardGauges: {
          BTC_STAKER: {
            coins: [{ amount, denom: "ubbn" }],
            withdrawnCoins: [],
          },
        },
      });
    };

    console.log("Successfully injected BBN query mocks");

    // @ts-ignore - helper only available in E2E browser context
    window.__decodeBank = (b64: string) => {
      try {
        const {
          QueryBalanceResponse,
        } = require("cosmjs-types/cosmos/bank/v1beta1/query");
        const decoded = QueryBalanceResponse.decode(Buffer.from(b64, "base64"));
        console.log("[E2E] Decoded Bank Balance in browser", decoded);
      } catch (err) {
        console.error("[E2E] Failed to decode bank balance", err);
      }
    };

    // Patch SigningStargateClient.connectWithSigner to avoid network/crypto issues
    (function patchSSC() {
      const patch = (ssc: any) => {
        if (ssc && typeof ssc.connectWithSigner === "function") {
          ssc.connectWithSigner = async () => {
            console.log("[E2E] Returning mocked SigningStargateClient");
            return {
              simulate: async () => ({}),
              signAndBroadcast: async () => ({ code: 0 }),
            } as any;
          };
          console.log("[E2E] Patched SigningStargateClient.connectWithSigner");
        }
      };

      // Attempt immediately
      // @ts-ignore
      patch(window.SigningStargateClient);

      // Then poll in case module loads later
      const id = setInterval(() => {
        // @ts-ignore
        if (window.SigningStargateClient) {
          // @ts-ignore
          patch(window.SigningStargateClient);
          clearInterval(id);
        }
      }, 50);
    })();
  }, rewardAmount);

  // Intercept Tendermint ABCI queries in the browser context
  await page.route("**/abci_query?*", async (route) => {
    const url = new URL(route.request().url());
    const path = url.searchParams.get("path") || "";

    // Normalize
    const decodedPath = decodeURIComponent(path).replace(/"/g, "");

    console.log("[E2E] ABCI query intercepted", {
      original: route.request().url(),
      path,
      decodedPath,
    });

    if (
      decodedPath.includes("babylon.incentive.Query/RewardGauges") ||
      decodedPath.includes("babylon.incentive.v1.Query/RewardGauges")
    ) {
      console.log("[E2E] Mocking RewardGauges response");
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: -1,
          result: {
            response: {
              code: 0,
              log: "",
              info: "",
              index: "0",
              key: null,
              value: rewardGaugeBase64,
              proof_ops: null,
              height: "1",
              codespace: "",
            },
          },
        }),
      });
      return;
    }

    if (decodedPath.includes("cosmos.bank.v1beta1.Query/Balance")) {
      console.log("[E2E] Mocking Bank Balance response");
      try {
        const {
          QueryBalanceResponse,
        } = require("cosmjs-types/cosmos/bank/v1beta1/query");
        console.log(
          "[E2E] Decoded bank response Node",
          QueryBalanceResponse.decode(Buffer.from(balanceBase64, "base64")),
        );
      } catch (e) {
        console.error("[E2E] Node decode error", e);
      }
      // Dump decoded bank balance in browser context for verification
      try {
        // @ts-ignore - page() is internal Playwright API not in type defs
        await (route as any).page().evaluate((b64: string) => {
          // @ts-ignore
          window.__decodeBank?.(b64);
        }, balanceBase64);
      } catch {}

      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: -1,
          result: {
            response: {
              code: 0,
              log: "",
              info: "",
              index: "0",
              key: null,
              value: balanceBase64,
              proof_ops: null,
              height: "1",
              codespace: "",
            },
          },
        }),
      });
      return;
    }

    console.log("[E2E] Passing through ABCI query");
    // Otherwise, continue normally
    await route.continue();
  });

  // Intercept JSON-RPC POST requests hitting the RPC endpoint root
  await page.route("**", async (route, request) => {
    if (request.method() !== "POST") {
      return route.continue();
    }

    const postData = request.postData();
    let parsed: any = null;
    try {
      parsed = postData ? JSON.parse(postData) : null;
    } catch {
      // not JSON, continue
      return route.continue();
    }

    // Handle status method for Tendermint34Client
    if (parsed && parsed.method === "status") {
      console.log("[E2E] Mocking status response (POST)");
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: parsed.id ?? -1,
          result: {
            node_info: {
              network: "bbn-test",
              version: "0.34.0",
              moniker: "e2e-mock-node",
              id: "0e0e",
              listen_addr: "0.0.0.0:26656",
              channels: "40202122233038606100",
              other: {},
              protocol_version: {
                app: "1",
                block: "11",
                p2p: "7",
              },
            },
            sync_info: {
              latest_block_height: "1",
              latest_block_time: new Date().toISOString(),
              catching_up: false,
              latest_block_hash:
                "0000000000000000000000000000000000000000000000000000000000000000",
              latest_app_hash:
                "0000000000000000000000000000000000000000000000000000000000000000",
            },
            validator_info: {
              address: "0e0e",
              pub_key: {
                Sum: {
                  value: {
                    ed25519: "AQIDBAU=",
                  },
                },
              },
              voting_power: "0",
            },
          },
        }),
      });
    }

    if (!parsed || parsed.method !== "abci_query") {
      return route.continue();
    }

    const pathParam = parsed.params?.path || "";
    console.log("[E2E] JSON-RPC POST body data", {
      pathParam,
      data: parsed.params?.data,
    });
    console.log("[E2E] JSON-RPC abci_query intercepted", { pathParam });

    if (
      pathParam.includes("babylon.incentive.Query/RewardGauges") ||
      pathParam.includes("babylon.incentive.v1.Query/RewardGauges")
    ) {
      console.log("[E2E] Mocking RewardGauges response (POST)");
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: parsed.id ?? -1,
          result: {
            response: {
              code: 0,
              log: "",
              info: "",
              index: "0",
              key: null,
              value: rewardGaugeBase64,
              proof_ops: null,
              height: "1",
              codespace: "",
            },
          },
        }),
      });
    }

    if (pathParam.includes("cosmos.bank.v1beta1.Query/Balance")) {
      console.log("[E2E] Mocking Bank Balance response (POST)");
      // Dump decoded in browser
      try {
        // @ts-ignore
        await (route as any).page().evaluate((b64: string) => {
          // @ts-ignore
          window.__decodeBank?.(b64);
        }, balanceBase64);
      } catch {}

      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: parsed.id ?? -1,
          result: {
            response: {
              code: 0,
              log: "",
              info: "",
              index: "0",
              key: null,
              value: balanceBase64,
              proof_ops: null,
              height: "1",
              codespace: "",
            },
          },
        }),
      });
    }

    // Not one of our mocked paths
    return route.continue();
  });

  // Intercept Tendermint /status (HTTP GET) requests
  await page.route("**/status*", async (route) => {
    console.log("[E2E] Mocking Tendermint /status response (GET)");
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: -1,
        result: {
          node_info: {
            network: "bbn-test",
            version: "0.34.0",
            moniker: "e2e-mock-node",
            id: "0e0e",
            listen_addr: "0.0.0.0:26656",
            channels: "40202122233038606100",
            other: {},
            protocol_version: {
              app: "1",
              block: "11",
              p2p: "7",
            },
          },
          sync_info: {
            latest_block_height: "1",
            latest_block_time: new Date().toISOString(),
            catching_up: false,
            latest_block_hash:
              "0000000000000000000000000000000000000000000000000000000000000000",
            latest_app_hash:
              "0000000000000000000000000000000000000000000000000000000000000000",
          },
          validator_info: {
            address: "0e0e",
            pub_key: {
              Sum: {
                value: {
                  ed25519: "AQIDBAU=",
                },
              },
            },
            voting_power: "0",
          },
        },
      }),
    });
  });
};
