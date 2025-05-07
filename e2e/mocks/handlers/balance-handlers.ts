import { rest } from "msw";

export const balanceHandlers = [
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
];
