import { rest } from "msw";

export const btcHandlers = [
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
];
