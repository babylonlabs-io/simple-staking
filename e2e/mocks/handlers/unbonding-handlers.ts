import { rest } from "msw";

import { activeTX } from "../../mock/tx/unbonding";

// Mutable reference to the response payload so tests can update it on demand
let delegationsResponse: any = activeTX;

export const setDelegationsResponse = (data: any) => {
  delegationsResponse = data;
};

export const unbondingHandlers = [
  // Delegations endpoint
  rest.get("/v1/staker/delegations*", (req, res, ctx) => {
    return res(ctx.json(delegationsResponse));
  }),

  // Eligibility endpoint
  rest.get("/v1/unbonding/eligibility*", (_req, res, ctx) => {
    return res(ctx.json({}));
  }),

  // Unbonding POST endpoint – always accept
  rest.post("/v1/unbonding", (_req, res, ctx) => {
    return res(ctx.status(202), ctx.json({ message: "Request accepted" }));
  }),
];
