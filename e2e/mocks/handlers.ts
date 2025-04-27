import { Page } from "@playwright/test";
import { rest } from "msw";
import { setupServer } from "msw/node";

declare global {
  interface Window {
    require: any;
    __e2eTestMode: boolean;
    __mockVerifyBTCAddress: () => Promise<boolean>;
  }
}

export const handlers = [
  rest.get(
    "https://staking-api.babylonlabs.io/v1/staker/delegations*",
    (req, res, ctx) => {
      return res(
        ctx.json({
          data: [],
          pagination: { next_key: null, total: "0" },
        }),
      );
    },
  ),

  rest.get(
    "https://staking-api.babylonlabs.io/v2/delegations*",
    (req, res, ctx) => {
      return res(
        ctx.json({
          data: [],
          pagination: { next_key: "", total: "0" },
        }),
      );
    },
  ),

  rest.get(
    "https://staking-api.babylonlabs.io/v2/network-info*",
    (req, res, ctx) => {
      return res(
        ctx.json({
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
        }),
      );
    },
  ),

  rest.get(
    "https://staking-api.babylonlabs.io/address/screening*",
    (req, res, ctx) => {
      return res(
        ctx.json({
          data: {
            btc_address: {
              risk: "low",
            },
          },
        }),
      );
    },
  ),

  rest.post(
    "https://staking-api.babylonlabs.io/log-terms-acceptance",
    (req, res, ctx) => {
      return res(
        ctx.json({
          success: true,
        }),
      );
    },
  ),

  rest.get(
    "https://staking-api.babylonlabs.io/v2/balances*",
    (req, res, ctx) => {
      return res(
        ctx.json({
          balance: {
            bbn: "1000000",
            stakable_btc: "12345678",
          },
        }),
      );
    },
  ),

  rest.get("https://staking-api.babylonlabs.io/v2/staked*", (req, res, ctx) => {
    return res(
      ctx.json({
        staked: {
          btc: "12345678",
          delegated_btc: "12345678",
        },
      }),
    );
  }),

  rest.get(
    "https://staking-api.babylonlabs.io/v2/stakable-btc*",
    (req, res, ctx) => {
      return res(
        ctx.json({
          balance: "12345678",
        }),
      );
    },
  ),

  rest.get(
    "https://staking-api.babylonlabs.io/v2/rewards*",
    (req, res, ctx) => {
      return res(
        ctx.json({
          rewards: "500000",
        }),
      );
    },
  ),

  // Mempool API handlers
  rest.get("*/api/address/*/utxo", (req, res, ctx) => {
    return res(
      ctx.json([
        {
          txid: "txid1",
          vout: 0,
          value: 12345678,
          status: {
            confirmed: true,
          },
        },
      ]),
    );
  }),

  rest.get("*/api/v1/validate-address/*", (req, res, ctx) => {
    return res(
      ctx.json({
        isvalid: true,
        scriptPubKey: "0014abcdef1234567890abcdef1234567890abcdef12",
      }),
    );
  }),

  rest.get("*/api/address/*", (req, res, ctx) => {
    return res(
      ctx.json({
        chain_stats: {
          funded_txo_sum: 12345678,
          spent_txo_sum: 0,
        },
      }),
    );
  }),
];

const server = setupServer(...handlers);

export const mockVerifyBTCAddress = async (page: Page) => {
  console.log("Setting up verifyBTCAddress mock...");

  server.listen({ onUnhandledRequest: "bypass" });

  await page.addInitScript(() => {
    window.__e2eTestMode = true;
    window.__mockVerifyBTCAddress = async () => {
      console.log("Global mock verifyBTCAddress called, returning true");
      return true;
    };

    console.log("Successfully set up verifyBTCAddress mocks");
  });

  console.log("verifyBTCAddress mock setup complete");

  return () => {
    server.close();
  };
};
