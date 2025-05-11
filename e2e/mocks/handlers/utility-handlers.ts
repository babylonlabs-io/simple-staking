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

  // Match ALL healthcheck requests regardless of URL format
  rest.get("*", (req, res, ctx) => {
    // Check if URL ends with or contains /healthcheck
    const url = req.url.toString();
    if (url.includes("/healthcheck")) {
      console.log("E2E: healthcheck intercepted:", url);
      return res(
        ctx.json({
          data: "ok",
        }),
      );
    }
    return res(ctx.status(404));
  }),
];
