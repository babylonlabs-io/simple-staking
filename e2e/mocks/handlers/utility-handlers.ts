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

  rest.get("*", (req, res, ctx) => {
    console.log("E2E: healthcheck intercepted:", req.url.toString());
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
