import { rest } from "msw";

import { MOCK_VALUES } from "./constants";

export const balanceHandlers = [
  rest.get("/v2/balances*", (req, res, ctx) => {
    const response = {
      balance: {
        bbn: MOCK_VALUES.BBN_BALANCE,
        stakable_btc: MOCK_VALUES.STAKABLE_BTC,
      },
    };
    return res(ctx.json(response));
  }),

  rest.get("/v2/staked*", (req, res, ctx) => {
    const response = {
      staked: {
        btc: MOCK_VALUES.STAKED_BTC,
        delegated_btc: MOCK_VALUES.STAKED_BTC,
      },
    };
    return res(ctx.json(response));
  }),

  rest.get("/v2/stakable-btc*", (req, res, ctx) => {
    const response = {
      balance: MOCK_VALUES.STAKABLE_BTC,
    };
    return res(ctx.json(response));
  }),

  rest.get("/v2/rewards*", (req, res, ctx) => {
    const response = {
      rewards: MOCK_VALUES.REWARDS,
    };
    return res(ctx.json(response));
  }),
];
