import { Page } from "@playwright/test";

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

  await page.route("**/abci_query?*", async (route) => {
    const url = new URL(route.request().url());
    const path = url.searchParams.get("path") || "";

    const decodedPath = decodeURIComponent(path).replace(/"/g, "");

    const pathHandlers = {
      "babylon.incentive": async () => {
        if (
          decodedPath.includes("Query/RewardGauges") ||
          decodedPath.includes("v1.Query/RewardGauges")
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
          return true;
        }
        return false;
      },
      "cosmos.bank.v1beta1.Query/Balance": async () => {
        try {
          const {
            QueryBalanceResponse,
          } = require("cosmjs-types/cosmos/bank/v1beta1/query");
        } catch (e) {
          console.error("Error loading QueryBalanceResponse:", e);
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
        return true;
      },
    };

    for (const [pathKey, handler] of Object.entries(pathHandlers)) {
      if (decodedPath.includes(pathKey)) {
        const handled = await handler();
        if (handled) return;
      }
    }

    try {
      await route.continue();
    } catch (error) {
      console.error(
        "Failed to continue route, it may have been handled already:",
        error,
      );
    }
  });

  await page.route("**", async (route, request) => {
    if (request.method() !== "POST") {
      return route.continue();
    }

    const postData = request.postData();
    const url = request.url();

    let parsed: any = null;
    try {
      parsed = postData ? JSON.parse(postData) : null;
    } catch (err) {
      console.error("Failed to parse POST data:", err);
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

    const pathHandlers = {
      "babylon.incentive": async () => {
        if (
          pathParam.includes("Query/RewardGauges") ||
          pathParam.includes("v1.Query/RewardGauges")
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
        return false;
      },
      "cosmos.bank.v1beta1.Query/Balance": async () => {
        try {
          // Skip the evaluation since it's causing issues in CI
        } catch (e) {
          console.error("Error in POST evaluate:", e);
        }

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

        try {
          await route.fulfill(response);
        } catch (error) {
          console.error("Failed to fulfill bank balance request:", error);
        }
        return true;
      },
    };

    for (const [pathKey, handler] of Object.entries(pathHandlers)) {
      if (pathParam.includes(pathKey)) {
        const handled = await handler();
        if (handled) return;
      }
    }

    try {
      await route.continue();
    } catch (error) {}
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

    try {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          data: [mockDelegation],
          pagination: { next_key: "", total: "1" },
        }),
      });
    } catch (error) {
      console.error("Failed to fulfill delegations request:", error);
    }
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

  await page.route("**/v2/network-info*", async (route) => {
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
};
