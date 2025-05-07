import { Page } from "@playwright/test";
import { rest } from "msw";
import { setupServer } from "msw/node";

export const handlers = [
  rest.get("/v1/staker/delegations*", (req, res, ctx) => {
    console.log("[MSW DEBUG] GET /v1/staker/delegations* handler called");
    return res(
      ctx.json({
        data: [],
        pagination: { next_key: null, total: "0" },
      }),
    );
  }),

  rest.get("/v2/delegations*", (req, res, ctx) => {
    console.log("[MSW DEBUG] GET /v2/delegations* handler called");
    const delegation = {
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
    console.log(
      "[MSW DEBUG] Returning delegation with amount:",
      delegation.delegation_staking.staking_amount,
    );

    return res(
      ctx.json({
        data: [delegation],
        pagination: { next_key: "", total: "1" },
      }),
    );
  }),

  rest.get("/v2/network-info*", (req, res, ctx) => {
    console.log("[MSW DEBUG] GET /v2/network-info* handler called");
    const response = {
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
            {
              version: 1,
              covenant_pks: [
                "0279be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798",
                "02c6047f9441ed7d6d3045406e95c07cd85c778e4b8cef3ca7abac09b95c709ee5",
                "02f9308a019258c31049344f85f89d5229b531c845836f99b08601f113bce036f9",
              ],
              covenant_quorum: 3,
              min_staking_value_sat: 150000,
              max_staking_value_sat: 1500000,
              min_staking_time_blocks: 288,
              max_staking_time_blocks: 2880,
              slashing_pk_script:
                "76a914c96e00cdddfe208629638e394358b2770e636b2388ac",
              min_slashing_tx_fee_sat: 1500,
              slashing_rate: "0.15",
              unbonding_time_blocks: 288,
              unbonding_fee_sat: 3000,
              min_commission_rate: "0.1",
              max_active_finality_providers: 15,
              delegation_creation_base_gas_fee: 60000,
              btc_activation_height: 200,
              allow_list_expiration_height: 300,
            },
          ],
          btc: [
            {
              version: 0,
              btc_confirmation_depth: 6,
            },
            {
              version: 1,
              btc_confirmation_depth: 12,
            },
          ],
        },
      },
    };
    console.log("[MSW DEBUG] Returning network-info response");
    return res(ctx.json(response));
  }),

  rest.get("/address/screening*", (req, res, ctx) => {
    console.log("[MSW DEBUG] GET /address/screening* handler called");
    return res(
      ctx.json({
        data: {
          btc_address: {
            risk: "low",
          },
        },
      }),
    );
  }),

  rest.post("/log-terms-acceptance", (req, res, ctx) => {
    console.log("[MSW DEBUG] POST /log-terms-acceptance handler called");
    return res(
      ctx.json({
        success: true,
      }),
    );
  }),

  rest.get("/v2/balances*", (req, res, ctx) => {
    console.log("[MSW DEBUG] GET /v2/balances* handler called");
    const response = {
      balance: {
        bbn: "1000000",
        stakable_btc: "74175",
      },
    };
    console.log("[MSW DEBUG] Returning balances:", JSON.stringify(response));
    return res(ctx.json(response));
  }),

  rest.get("/v2/staked*", (req, res, ctx) => {
    console.log("[MSW DEBUG] GET /v2/staked* handler called");
    const response = {
      staked: {
        btc: "9876543",
        delegated_btc: "9876543",
      },
    };
    console.log("[MSW DEBUG] Returning staked:", JSON.stringify(response));
    return res(ctx.json(response));
  }),

  rest.get("/v2/stakable-btc*", (req, res, ctx) => {
    console.log("[MSW DEBUG] GET /v2/stakable-btc* handler called");
    const response = {
      balance: "74175",
    };
    console.log(
      "[MSW DEBUG] Returning stakable-btc:",
      JSON.stringify(response),
    );
    return res(ctx.json(response));
  }),

  rest.get("/v2/rewards*", (req, res, ctx) => {
    console.log("[MSW DEBUG] GET /v2/rewards* handler called");
    const response = {
      rewards: "500000",
    };
    console.log("[MSW DEBUG] Returning rewards:", JSON.stringify(response));
    return res(ctx.json(response));
  }),

  // Mempool API handlers
  rest.get("*/api/address/*/utxo", (req, res, ctx) => {
    console.log("[MSW DEBUG] GET */api/address/*/utxo handler called");
    const response = [
      {
        txid: "txid1",
        vout: 0,
        value: 74175,
        status: {
          confirmed: true,
        },
      },
    ];
    console.log("[MSW DEBUG] Returning UTXO:", JSON.stringify(response));
    return res(ctx.json(response));
  }),

  rest.get("*/api/v1/validate-address/*", (req, res, ctx) => {
    console.log("[MSW DEBUG] GET */api/v1/validate-address/* handler called");
    return res(
      ctx.json({
        isvalid: true,
        scriptPubKey: "0014abcdef1234567890abcdef1234567890abcdef12",
      }),
    );
  }),

  rest.get("*/api/address/*", (req, res, ctx) => {
    console.log("[MSW DEBUG] GET */api/address/* handler called");
    return res(
      ctx.json({
        chain_stats: {
          funded_txo_sum: 74175,
          spent_txo_sum: 0,
        },
      }),
    );
  }),

  rest.get(/.*\/abci_query$/, (req, res, ctx) => {
    const url = new URL(req.url.href);
    let pathParam = url.searchParams.get("path");
    console.log(`[MSW DEBUG] GET abci_query with path: ${pathParam}`);

    // The path can come wrapped in quotes or URL-encoded, normalize it.
    if (pathParam) {
      // Remove wrapping quotes if present
      if (pathParam.startsWith("%22") || pathParam.startsWith('"')) {
        try {
          pathParam = decodeURIComponent(pathParam);
        } catch (_) {
          // ignore
        }
        pathParam = pathParam.replace(/^\"|\"$/g, "");
      }
    }
    console.log(`[MSW DEBUG] Normalized path: ${pathParam}`);

    // ----- Reward Gauges -----
    if (
      pathParam?.includes("babylon.incentive.v1.Query/RewardGauges") ||
      pathParam?.includes("babylon.incentive.Query/RewardGauges")
    ) {
      console.log("[MSW DEBUG] Processing incentive/RewardGauges query");
      // Build a minimal QueryRewardGaugesResponse protobuf and encode it to base64
      try {
        // Dynamically import to avoid pulling the dependency when not needed
        const { incentivequery } = require("@babylonlabs-io/babylon-proto-ts");

        const mockResponse =
          incentivequery.QueryRewardGaugesResponse.fromPartial({
            rewardGauges: {
              BTC_STAKER: {
                coins: [{ amount: "500000", denom: "ubbn" }],
                withdrawnCoins: [],
              },
            },
          });

        const encoded =
          incentivequery.QueryRewardGaugesResponse.encode(
            mockResponse,
          ).finish();

        const base64Value = Buffer.from(encoded).toString("base64");
        console.log("[MSW DEBUG] Generated reward gauges base64 response");

        return res(
          ctx.json({
            jsonrpc: "2.0",
            id: -1,
            result: {
              response: {
                code: 0,
                log: "",
                info: "",
                index: "0",
                key: null,
                value: base64Value,
                proof_ops: null,
                height: "0",
                codespace: "",
              },
            },
          }),
        );
      } catch (error) {
        // If protobuf import fails, let the request passthrough so we fail fast.
        console.error(
          "[MSW DEBUG] Failed to build mock RewardGauges response",
          error,
        );
        return req.passthrough();
      }
    }

    // ----- Bank Balance -----
    if (pathParam?.includes("cosmos.bank.v1beta1.Query/Balance")) {
      console.log(
        "[MSW DEBUG] Processing cosmos.bank.v1beta1.Query/Balance query",
      );
      try {
        const {
          QueryBalanceResponse,
        } = require("cosmjs-types/cosmos/bank/v1beta1/query");
        const mockResp = QueryBalanceResponse.fromPartial({
          balance: { denom: "ubbn", amount: "1000000" },
        });

        const encoded = QueryBalanceResponse.encode(mockResp).finish();
        const base64Value = Buffer.from(encoded).toString("base64");
        console.log(
          "[MSW DEBUG] Generated bank balance base64 response, amount: 1000000",
        );

        return res(
          ctx.json({
            jsonrpc: "2.0",
            id: -1,
            result: {
              response: {
                code: 0,
                log: "",
                info: "",
                index: "0",
                key: null,
                value: base64Value,
                proof_ops: null,
                height: "0",
                codespace: "",
              },
            },
          }),
        );
      } catch (error) {
        console.error(
          "[MSW DEBUG] Failed to build mock Bank Balance response",
          error,
        );
        return req.passthrough();
      }
    }

    // For all other ABCI queries, passthrough
    console.log("[MSW DEBUG] Unhandled abci_query, passing through");
    return req.passthrough();
  }),
];

const server = setupServer(...handlers);

export const mockVerifyBTCAddress = async (page: Page) => {
  console.log("[MSW DEBUG] Setting up mockVerifyBTCAddress");
  server.listen({ onUnhandledRequest: "bypass" });
  console.log("[MSW DEBUG] MSW server started");

  await page.addInitScript(() => {
    console.log("[MSW DEBUG] Adding init script for __mockVerifyBTCAddress");
    window.__e2eTestMode = true;
    window.__mockVerifyBTCAddress = async () => {
      console.log("[MSW DEBUG] __mockVerifyBTCAddress called, returning true");
      return true;
    };
  });

  return () => {
    console.log("[MSW DEBUG] Shutting down MSW server");
    server.close();
  };
};
