import { rest } from "msw";

import { MOCK_VALUES } from "./constants";

export const blockchainHandlers = [
  rest.get(/.*\/abci_query$/, (req, res, ctx) => {
    const url = new URL(req.url.href);
    let pathParam = url.searchParams.get("path");

    // The path can come wrapped in quotes or URL-encoded, normalize it.
    if (pathParam) {
      // Remove wrapping quotes if present
      if (pathParam.startsWith("%22") || pathParam.startsWith('"')) {
        try {
          pathParam = decodeURIComponent(pathParam);
        } catch (_) {
          // ignore
        }
        pathParam = pathParam.replace(/^\"|\"$/g, "");
      }
    }

    // ----- Reward Gauges -----
    if (
      pathParam?.includes("babylon.incentive.v1.Query/RewardGauges") ||
      pathParam?.includes("babylon.incentive.Query/RewardGauges")
    ) {
      // Build a minimal QueryRewardGaugesResponse protobuf and encode it to base64
      try {
        // Dynamically import to avoid pulling the dependency when not needed
        const { incentivequery } = require("@babylonlabs-io/babylon-proto-ts");

        const mockResponse =
          incentivequery.QueryRewardGaugesResponse.fromPartial({
            rewardGauges: {
              BTC_STAKER: {
                coins: [{ amount: MOCK_VALUES.REWARDS, denom: "ubbn" }],
                withdrawnCoins: [],
              },
            },
          });

        const encoded =
          incentivequery.QueryRewardGaugesResponse.encode(
            mockResponse,
          ).finish();

        const base64Value = Buffer.from(encoded).toString("base64");

        return res(
          ctx.json({
            jsonrpc: "2.0",
            id: -1,
            result: {
              response: {
                code: 0,
                log: "",
                info: "",
                index: "0",
                key: null,
                value: base64Value,
                proof_ops: null,
                height: "0",
                codespace: "",
              },
            },
          }),
        );
      } catch (error) {
        // If protobuf import fails, let the request passthrough so we fail fast.
        console.error("Failed to build mock RewardGauges response", error);
        return req.passthrough();
      }
    }

    // ----- Bank Balance -----
    if (pathParam?.includes("cosmos.bank.v1beta1.Query/Balance")) {
      try {
        const {
          QueryBalanceResponse,
        } = require("cosmjs-types/cosmos/bank/v1beta1/query");
        const mockResp = QueryBalanceResponse.fromPartial({
          balance: { denom: "ubbn", amount: MOCK_VALUES.BBN_BALANCE },
        });

        const encoded = QueryBalanceResponse.encode(mockResp).finish();
        const base64Value = Buffer.from(encoded).toString("base64");

        return res(
          ctx.json({
            jsonrpc: "2.0",
            id: -1,
            result: {
              response: {
                code: 0,
                log: "",
                info: "",
                index: "0",
                key: null,
                value: base64Value,
                proof_ops: null,
                height: "0",
                codespace: "",
              },
            },
          }),
        );
      } catch (error) {
        console.error("Failed to build mock Bank Balance response", error);
        return req.passthrough();
      }
    }

    // For all other ABCI queries, passthrough
    return req.passthrough();
  }),
];
