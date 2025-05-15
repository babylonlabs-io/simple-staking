import { rest } from "msw";

import { MOCK_VALUES } from "./constants";

export const btcHandlers = [
  // Mempool API handlers
  rest.get("*/api/address/*/utxo", (req, res, ctx) => {
    const response = [
      {
        txid: "txid1",
        vout: 0,
        value: parseInt(MOCK_VALUES.STAKABLE_BTC),
        status: {
          confirmed: true,
        },
      },
    ];
    return res(ctx.json(response));
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
          funded_txo_sum: parseInt(MOCK_VALUES.STAKABLE_BTC),
          spent_txo_sum: 0,
        },
      }),
    );
  }),
];
