import { incentivequery } from "@babylonlabs-io/babylon-proto-ts";
import type { Page } from "@playwright/test";
import { QueryBalanceResponse } from "cosmjs-types/cosmos/bank/v1beta1/query.js";

import mockData from "./constants";

export const injectBBNQueries = async (
  page: Page,
  rewardAmount: string = mockData.bbnQueries.rewardAmount,
) => {
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
    balance: { denom: "ubbn", amount: mockData.bbnQueries.bbnBalance },
  });

  const balanceBase64: string = Buffer.from(
    QueryBalanceResponse.encode(balanceProto).finish(),
  ).toString("base64");

  QueryBalanceResponse.decode(Buffer.from(balanceBase64, "base64"));

  await page.addInitScript(() => {
    (window as any).__e2eTestMode = true;
  });

  await page.route("**/v2/staked*", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        staked: {
          btc: mockData.bbnQueries.stakedBtc,
          delegated_btc: mockData.bbnQueries.stakedBtc,
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
          bbn: mockData.bbnQueries.bbnBalance,
          stakable_btc: mockData.bbnQueries.stakableBtc,
        },
      }),
    });
  });

  await page.route("**/v2/stakable-btc*", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        balance: mockData.bbnQueries.stakableBtc,
      }),
    });
  });

  await page.route("**/v2/rewards*", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        rewards: mockData.bbnQueries.rewardAmount,
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
    if (request.method() !== "POST" && request.method() !== "OPTIONS") {
      return route.continue();
    }

    // For OPTIONS preflight, respond with basic CORS headers and 200
    if (request.method() === "OPTIONS") {
      return route.fulfill({
        status: 200,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
          "Access-Control-Allow-Headers": "content-type",
        },
        body: "",
      });
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

    if (!parsed) {
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ result: {} }),
      });
    }

    if (parsed.method && !["abci_query", "status"].includes(parsed.method)) {
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: parsed.id ?? -1,
          result: {},
        }),
      });
    }

    if (parsed.method !== "abci_query") {
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
      finality_provider_btc_pks_hex:
        mockData.bbnQueries.mockDelegation.finality_provider_btc_pks_hex,
      params_version: mockData.bbnQueries.mockDelegation.params_version,
      staker_btc_pk_hex: mockData.bbnQueries.mockDelegation.staker_btc_pk_hex,
      delegation_staking: {
        staking_tx_hex:
          mockData.bbnQueries.mockDelegation.delegation_staking.staking_tx_hex,
        staking_tx_hash_hex:
          mockData.bbnQueries.mockDelegation.delegation_staking
            .staking_tx_hash_hex,
        staking_timelock:
          mockData.bbnQueries.mockDelegation.delegation_staking
            .staking_timelock,
        staking_amount:
          mockData.bbnQueries.mockDelegation.delegation_staking.staking_amount,
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
      state: mockData.bbnQueries.mockDelegation.state,
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
                covenant_pks: mockData.bbnQueries.networkInfo.covenant_pks,
                covenant_quorum:
                  mockData.bbnQueries.networkInfo.covenant_quorum,
                min_staking_value_sat:
                  mockData.bbnQueries.networkInfo.min_staking_value_sat,
                max_staking_value_sat:
                  mockData.bbnQueries.networkInfo.max_staking_value_sat,
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

  await page.route("**/healthcheck*", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        data: "ok",
      }),
    });
  });

  await page.route("**/v2/prices*", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        data: {
          BABY: 0.09868765127511409,
          BTC: 104126.79433684294,
        },
      }),
    });
  });

  await page.route("**/v2/stats*", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        data: {
          active_tvl: 3238664649941,
          active_delegations: 21906,
          active_finality_providers: 60,
          total_finality_providers: 114,
          total_active_tvl: 4956159209022,
          total_active_delegations: 43478,
          btc_staking_apy: 0.011705617401439945,
          btc_staking_apr: 0.011705617401439945,
        },
      }),
    });
  });

  await page.route("**/v2/finality-providers*", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        data: [
          {
            btc_pk:
              "e8a3ef3ca40ade56bd986663f24d5ab3bcc3cd18a88a10a8cd25d8af42314f62",
            state: "FINALITY_PROVIDER_STATUS_INACTIVE",
            description: {
              moniker: "PRO Delegators",
              identity: "44771D06A00DD695",
              website: "https://pro-delegators.com",
              security_contact: "contact@pro-delegators.com",
              details: "Advanced Node Services for Professional Delegators",
            },
            commission: "0.030000000000000000",
            active_tvl: 2500000,
            active_delegations: 4,
          },
        ],
        pagination: {
          next_key: "",
        },
      }),
    });
  });

  await page.route("**/v1/finality-providers*", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        data: [
          {
            btc_pk:
              "e8a3ef3ca40ade56bd986663f24d5ab3bcc3cd18a88a10a8cd25d8af42314f62",
            state: "FINALITY_PROVIDER_STATUS_INACTIVE",
            description: {
              moniker: "PRO Delegators",
              identity: "44771D06A00DD695",
              website: "https://pro-delegators.com",
              security_contact: "contact@pro-delegators.com",
              details: "Advanced Node Services for Professional Delegators",
            },
            commission: "0.030000000000000000",
            active_tvl: 2500000,
            total_tvl: 2500000,
            active_delegations: 4,
            total_delegations: 4,
          },
        ],
        pagination: {
          next_key: "",
        },
      }),
    });
  });

  await page.route("**/v1/staker/delegations*", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        data: [
          {
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
          },
        ],
        pagination: { next_key: "", total: "1" },
      }),
    });
  });

  await page.route("**/address/screening*", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        data: {
          btc_address: {
            risk: "low",
          },
        },
      }),
    });
  });

  await page.route("**/log-terms-acceptance", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        data: {
          status: true,
        },
      }),
    });
  });

  // Intercept LCD bank balance by denom
  await page.route("**/cosmos/bank/v1beta1/balances/**", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        balance: {
          denom: "ubbn",
          amount: "1000000",
        },
      }),
    });
  });

  await page.route("**/api/address/*/utxo", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify([
        {
          txid: "txid1",
          vout: 0,
          value: Number(mockData.bbnQueries.stakableBtc),
          status: {
            confirmed: true,
          },
        },
      ]),
    });
  });

  await page.route("**/api/v1/validate-address/*", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        isvalid: true,
        scriptPubKey: "0014abcdef1234567890abcdef1234567890abcdef12",
      }),
    });
  });

  await page.route("**/api/address/*", async (route) => {
    if (route.request().url().includes("/utxo")) {
      return route.continue();
    }
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        chain_stats: {
          funded_txo_sum: Number(mockData.bbnQueries.stakableBtc),
          spent_txo_sum: 0,
        },
      }),
    });
  });
};
