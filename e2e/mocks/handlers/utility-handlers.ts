import { rest } from "msw";

export const utilityHandlers = [
  rest.get("/address/screening*", (req, res, ctx) => {
    console.log("[MSW DEBUG] GET /address/screening* handler called");
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
    console.log("[MSW DEBUG] POST /log-terms-acceptance handler called");
    return res(
      ctx.json({
        success: true,
      }),
    );
  }),

  rest.get("/healthcheck*", (req, res, ctx) => {
    console.log("[MSW DEBUG] GET /healthcheck* handler called");
    // Simulate healthy backend response so the app is not marked as geo-blocked in CI.
    return res(
      ctx.json({
        data: "ok",
      }),
    );
  }),
];
