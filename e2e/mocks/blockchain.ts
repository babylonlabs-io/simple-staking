import { Page } from "@playwright/test";

export type BBNWalletType = "Keplr" | "Leap" | "Cosmostation";

export type BTCWalletType = "OKX" | "Unisat" | "OneKey" | "Keystone";

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

      if (walletType === "OKX") {
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
            if (chain === "BTC" || chain === "Bitcoin" || chain === "bitcoin") {
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
                return "mainnet";
              case "wallet_switchBitcoinNetwork":
                return true;
              case "btc_getBalance":
                return { confirmed: 12345678, unconfirmed: 0, total: 12345678 };
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
    }, walletType);

    const isInjected = await verifyBTCWalletInjected(page);
    if (!isInjected) {
      throw new Error("BTC wallet was not properly injected");
    }
  } catch (error) {
    throw error;
  }
};

const verifyBTCWalletInjected = async (page: Page): Promise<boolean> => {
  try {
    return await page.evaluate(() => {
      return Boolean(window.btcwallet);
    });
  } catch (error) {
    return false;
  }
};

const verifyBBNWalletInjected = async (page: Page): Promise<boolean> => {
  try {
    return await page.evaluate(() => {
      return Boolean(window.bbnwallet);
    });
  } catch (error) {
    return false;
  }
};

export const injectBBNQueries = async (
  page: Page,
  rewardAmount: string = "500000",
) => {
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

  const balanceProto = QueryBalanceResponse.fromPartial({
    balance: { denom: "ubbn", amount: "1000000" },
  });

  const balanceBase64: string = Buffer.from(
    QueryBalanceResponse.encode(balanceProto).finish(),
  ).toString("base64");

  QueryBalanceResponse.decode(Buffer.from(balanceBase64, "base64"));

  await page.addInitScript((amount) => {
    window.__e2eTestMode = true;

    window.mockCosmJSBankBalance = (address) => {
      return Promise.resolve({
        amount: "1000000",
        denom: "ubbn",
      });
    };

    window.mockCosmJSRewardsQuery = (address) => {
      return Promise.resolve({
        rewardGauges: {
          BTC_STAKER: {
            coins: [{ amount, denom: "ubbn" }],
            withdrawnCoins: [],
          },
        },
      });
    };

    // @ts-ignore - helper only available in E2E browser context
    window.__decodeBank = (b64: string) => {
      try {
        const {
          QueryBalanceResponse,
        } = require("cosmjs-types/cosmos/bank/v1beta1/query");
        const decoded = QueryBalanceResponse.decode(Buffer.from(b64, "base64"));
      } catch (err) {}
    };

    (function patchSSC() {
      const patch = (ssc: any) => {
        if (ssc && typeof ssc.connectWithSigner === "function") {
          ssc.connectWithSigner = async () => {
            return {
              simulate: async () => ({}),
              signAndBroadcast: async () => ({ code: 0 }),
            } as any;
          };
        }
      };

      // @ts-ignore
      patch(window.SigningStargateClient);

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

  await page.route("**/abci_query?*", async (route) => {
    const url = new URL(route.request().url());
    const path = url.searchParams.get("path") || "";

    const decodedPath = decodeURIComponent(path).replace(/"/g, "");
    if (
      decodedPath.includes("babylon.incentive.Query/RewardGauges") ||
      decodedPath.includes("babylon.incentive.v1.Query/RewardGauges")
    ) {
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
      try {
        const {
          QueryBalanceResponse,
        } = require("cosmjs-types/cosmos/bank/v1beta1/query");
      } catch (e) {}
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

    await route.continue();
  });

  await page.route("**", async (route, request) => {
    if (request.method() !== "POST") {
      return route.continue();
    }

    const postData = request.postData();
    let parsed: any = null;
    try {
      parsed = postData ? JSON.parse(postData) : null;
    } catch {
      return route.continue();
    }

    if (parsed && parsed.method === "status") {
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

    if (
      pathParam.includes("babylon.incentive.Query/RewardGauges") ||
      pathParam.includes("babylon.incentive.v1.Query/RewardGauges")
    ) {
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

    return route.continue();
  });

  await page.route("**/status*", async (route) => {
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

  await page.route("**/v2/delegations*", async (route) => {
    const mockDelegation = {
      finality_provider_btc_pks_hex: [
        "0279be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798",
      ],
      params_version: 0,
      staker_btc_pk_hex:
        "02c6047f9441ed7d6d3045406e95c07cd85c778e4b8cef3ca7abac09b95c709ee5",
      delegation_staking: {
        staking_tx_hex: "00",
        staking_tx_hash_hex: "hash",
        staking_timelock: 0,
        staking_amount: 9876543,
        start_height: 0,
        end_height: 0,
        bbn_inception_height: 0,
        bbn_inception_time: new Date().toISOString(),
        slashing: {
          slashing_tx_hex: "",
          spending_height: 0,
        },
      },
      delegation_unbonding: {
        unbonding_timelock: 0,
        unbonding_tx: "",
        slashing: {
          unbonding_slashing_tx_hex: "",
          spending_height: 0,
        },
      },
      state: "ACTIVE",
    };
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        data: [mockDelegation],
        pagination: { next_key: "", total: "1" },
      }),
    });
  });

  await page.route("**/v2/balances*", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        balance: {
          bbn: "1000000",
          stakable_btc: "74175",
        },
      }),
    });
  });

  await page.route("**/v2/staked*", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        staked: {
          btc: "9876543",
          delegated_btc: "9876543",
        },
      }),
    });
  });

  await page.route("**/v2/stakable-btc*", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        balance: "74175",
      }),
    });
  });

  await page.route("**/v2/rewards*", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        rewards: "500000",
      }),
    });
  });
};
