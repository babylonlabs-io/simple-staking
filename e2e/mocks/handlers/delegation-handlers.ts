import { rest } from "msw";

import { mockDelegation, mockNetworkInfo } from "../constants";

export const delegationHandlers = [
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
    console.log(
      "[MSW DEBUG] Returning delegation with amount:",
      mockDelegation.delegation_staking.staking_amount,
    );

    return res(
      ctx.json({
        data: [mockDelegation],
        pagination: { next_key: "", total: "1" },
      }),
    );
  }),

  rest.get("/v2/network-info*", (req, res, ctx) => {
    console.log("[MSW DEBUG] GET /v2/network-info* handler called");
    console.log("[MSW DEBUG] Returning network-info response");
    return res(ctx.json(mockNetworkInfo));
  }),
];
