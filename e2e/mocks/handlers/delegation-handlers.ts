import { rest } from "msw";

import { mockDelegation, mockNetworkInfo } from "./constants";

export const delegationHandlers = [
  rest.get("/v1/staker/delegations*", (req, res, ctx) => {
    return res(
      ctx.json({
        data: [],
        pagination: { next_key: null, total: "0" },
      }),
    );
  }),

  rest.get("/v2/delegations*", (req, res, ctx) => {
    return res(
      ctx.json({
        data: [mockDelegation],
        pagination: { next_key: "", total: "1" },
      }),
    );
  }),

  rest.get("/v2/network-info*", (req, res, ctx) => {
    return res(ctx.json(mockNetworkInfo));
  }),
];
