import { rest } from "msw";

export const utilityHandlers = [
  rest.get("/address/screening*", (req, res, ctx) => {
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
    return res(
      ctx.json({
        success: true,
      }),
    );
  }),
];
