import { rest } from "msw";

export const balanceHandlers = [
  rest.get("/v2/balances*", (req, res, ctx) => {
    const response = {
      balance: {
        bbn: "1000000",
        stakable_btc: "74175",
      },
    };
    return res(ctx.json(response));
  }),

  rest.get("/v2/staked*", (req, res, ctx) => {
    const response = {
      staked: {
        btc: "9876543",
        delegated_btc: "9876543",
      },
    };
    return res(ctx.json(response));
  }),

  rest.get("/v2/stakable-btc*", (req, res, ctx) => {
    const response = {
      balance: "74175",
    };
    return res(ctx.json(response));
  }),

  rest.get("/v2/rewards*", (req, res, ctx) => {
    const response = {
      rewards: "500000",
    };
    return res(ctx.json(response));
  }),
];
