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

  rest.get("/healthcheck*", (req, res, ctx) => {
    // Simulate healthy backend response so the app is not marked as geo-blocked in CI.
    console.log("E2E:healthcheck is returned");
    return res(
      ctx.json({
        data: "ok",
      }),
    );
  }),
];
