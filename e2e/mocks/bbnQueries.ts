import { Page } from "@playwright/test";

export const injectBBNQueries = async (
  page: Page,
  rewardAmount: string = "500000",
) => {
  const { incentivequery } = require("@babylonlabs-io/babylon-proto-ts");
  const {
    QueryBalanceResponse,
  } = require("cosmjs-types/cosmos/bank/v1beta1/query");

  // Add debugging to track when mocks are initialized
  await page.evaluate(() => {
    console.log("[E2E DEBUG] Starting BBN query mocks initialization");
  });

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
    console.log("[E2E DEBUG] Initializing e2e test mode with mock handlers");

    window.mockCosmJSBankBalance = (address) => {
      console.log(`[E2E DEBUG] Mocking bank balance for address ${address}`);
      return Promise.resolve({
        amount: "1000000",
        denom: "ubbn",
      });
    };

    window.mockCosmJSRewardsQuery = (address) => {
      console.log(`[E2E DEBUG] Mocking rewards query for address ${address}`);
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
        console.log("[E2E DEBUG] Decoded bank balance:", decoded);
      } catch (err) {
        console.error("[E2E DEBUG] Failed to decode bank balance:", err);
      }
    };

    (function patchSSC() {
      const patch = (ssc: any) => {
        if (ssc && typeof ssc.connectWithSigner === "function") {
          console.log("[E2E DEBUG] Patching SigningStargateClient");
          ssc.connectWithSigner = async () => {
            console.log("[E2E DEBUG] Mock SigningStargateClient connected");
            return {
              simulate: async () => {
                console.log("[E2E DEBUG] Mock simulate called");
                return {};
              },
              signAndBroadcast: async () => {
                console.log("[E2E DEBUG] Mock signAndBroadcast called");
                return { code: 0 };
              },
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

  // Log all network requests to help debug what's happening
  await page.route("**", async (route) => {
    const url = route.request().url();
    const method = route.request().method();
    console.log(`[E2E DEBUG] Network request: ${method} ${url}`);

    await route.continue();
  });

  // These routes need to be more prioritized to ensure they capture the requests
  // Place them first, as Playwright processes routes in the order they're added
  await page.route("**/v2/staked*", async (route) => {
    console.log("[E2E DEBUG] Intercepting v2/staked request");
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

  await page.route("**/v2/balances*", async (route) => {
    console.log("[E2E DEBUG] Intercepting v2/balances request");
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

  await page.route("**/v2/stakable-btc*", async (route) => {
    console.log("[E2E DEBUG] Intercepting v2/stakable-btc request");
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        balance: "74175",
      }),
    });
  });

  await page.route("**/v2/rewards*", async (route) => {
    console.log("[E2E DEBUG] Intercepting v2/rewards request");
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        rewards: "500000",
      }),
    });
  });

  await page.route("**/abci_query?*", async (route) => {
    const url = new URL(route.request().url());
    const path = url.searchParams.get("path") || "";
    console.log(`[E2E DEBUG] abci_query request with path: ${path}`);

    const decodedPath = decodeURIComponent(path).replace(/"/g, "");
    if (
      decodedPath.includes("babylon.incentive.Query/RewardGauges") ||
      decodedPath.includes("babylon.incentive.v1.Query/RewardGauges")
    ) {
      console.log("[E2E DEBUG] Intercepting rewards query");
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
      console.log("[E2E DEBUG] Intercepting bank balance query GET method");
      try {
        console.log("[E2E DEBUG] Trying to load QueryBalanceResponse");
        const {
          QueryBalanceResponse,
        } = require("cosmjs-types/cosmos/bank/v1beta1/query");
        console.log("[E2E DEBUG] QueryBalanceResponse loaded successfully");
      } catch (e) {
        console.error("[E2E DEBUG] Error loading QueryBalanceResponse:", e);
      }

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
      console.log("[E2E DEBUG] Bank balance GET fulfillment completed");
      return;
    }

    console.log("[E2E DEBUG] Continuing with abci_query request");
    await route.continue();
  });

  // Add back the JSON-RPC POST handler for handling RPC calls
  await page.route("**", async (route, request) => {
    if (request.method() !== "POST") {
      return route.continue();
    }

    const postData = request.postData();
    const url = request.url();
    console.log(`[E2E DEBUG] POST request to: ${url}`);

    let parsed: any = null;
    try {
      parsed = postData ? JSON.parse(postData) : null;
      console.log(
        `[E2E DEBUG] POST data: ${JSON.stringify(parsed?.method || "unknown method")}`,
      );
    } catch (err) {
      console.log(`[E2E DEBUG] Failed to parse POST data: ${err}`);
      return route.continue();
    }

    if (parsed && parsed.method === "status") {
      console.log("[E2E DEBUG] Intercepting status request");
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
    console.log(`[E2E DEBUG] POST abci_query with path: ${pathParam}`);

    if (
      pathParam.includes("babylon.incentive.Query/RewardGauges") ||
      pathParam.includes("babylon.incentive.v1.Query/RewardGauges")
    ) {
      console.log("[E2E DEBUG] Intercepting POST rewards query");
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
      console.log("[E2E DEBUG] Intercepting POST bank balance query");
      console.log(
        "[E2E DEBUG] balanceBase64 content is valid:",
        Boolean(balanceBase64),
      );

      try {
        console.log("[E2E DEBUG] Going to evaluate window.__decodeBank");
        // Skip the evaluation since it's causing issues in CI
        console.log(
          "[E2E DEBUG] window.__decodeBank skipped due to CI issues - using direct fulfillment only",
        );
      } catch (e) {
        console.error("[E2E DEBUG] Error in POST evaluate:", e);
        // Continue with response despite errors
        console.log(
          "[E2E DEBUG] Continuing with response despite evaluation error",
        );
      }

      console.log("[E2E DEBUG] Preparing bank balance response");
      const response = {
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
      };
      console.log(
        "[E2E DEBUG] Bank balance response prepared, about to fulfill",
      );

      try {
        await route.fulfill(response);
        console.log(
          "[E2E DEBUG] Bank balance POST fulfillment completed successfully",
        );
      } catch (error) {
        console.error(
          "[E2E DEBUG] Failed to fulfill bank balance request:",
          error,
        );
      }
      return;
    }

    return route.continue();
  });

  // Add mock route for delegations
  await page.route("**/v2/delegations*", async (route) => {
    console.log("[E2E DEBUG] Intercepting v2/delegations request");
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
    console.log("[E2E DEBUG] Delegation mock prepared, about to fulfill");

    try {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          data: [mockDelegation],
          pagination: { next_key: "", total: "1" },
        }),
      });
      console.log("[E2E DEBUG] Delegation request fulfilled with mock data");
    } catch (error) {
      console.error(
        "[E2E DEBUG] Failed to fulfill delegations request:",
        error,
      );
    }
  });

  // Add dedicated status route handler - this is important for Cosmos chain health checks
  await page.route("**/status*", async (route) => {
    console.log("[E2E DEBUG] Intercepting direct status GET request");
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

  // Add route for network info
  await page.route("**/v2/network-info*", async (route) => {
    console.log("[E2E DEBUG] Intercepting v2/network-info request");
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        data: {
          staking_status: {
            is_staking_open: true,
          },
          params: {
            bbn: [
              {
                version: 0,
                covenant_pks: [
                  "0279be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798",
                  "02c6047f9441ed7d6d3045406e95c07cd85c778e4b8cef3ca7abac09b95c709ee5",
                  "02f9308a019258c31049344f85f89d5229b531c845836f99b08601f113bce036f9",
                ],
                covenant_quorum: 2,
                min_staking_value_sat: 100000,
                max_staking_value_sat: 1000000,
                min_staking_time_blocks: 144,
                max_staking_time_blocks: 1440,
                slashing_pk_script:
                  "76a914c96e00cdddfe208629638e394358b2770e636b2388ac",
                min_slashing_tx_fee_sat: 1000,
                slashing_rate: "0.1",
                unbonding_time_blocks: 144,
                unbonding_fee_sat: 2000,
                min_commission_rate: "0.05",
                max_active_finality_providers: 10,
                delegation_creation_base_gas_fee: 50000,
                btc_activation_height: 100,
                allow_list_expiration_height: 200,
              },
            ],
            btc: [
              {
                version: 0,
                btc_confirmation_depth: 6,
              },
            ],
          },
        },
      }),
    });
  });

  // Add these catch-all routes at the end
  await page.route("**/*staked*", async (route) => {
    console.log("[E2E DEBUG] Catch-all: Intercepting staked request");
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

  await page.route("**/*balance*", async (route) => {
    console.log("[E2E DEBUG] Catch-all: Intercepting balance request");
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

  await page.route("**/*reward*", async (route) => {
    console.log("[E2E DEBUG] Catch-all: Intercepting rewards request");
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        rewards: "500000",
      }),
    });
  });

  // Signal that mocks are ready
  await page.evaluate(() => {
    console.log("[E2E DEBUG] BBN query mocks initialization complete");
  });
};
