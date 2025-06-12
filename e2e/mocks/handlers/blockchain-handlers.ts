import { incentivequery } from "@babylonlabs-io/babylon-proto-ts";
import { QueryBalanceResponse } from "cosmjs-types/cosmos/bank/v1beta1/query.js";
import {
  type ResponseComposition,
  type RestContext,
  type RestRequest,
  rest,
} from "msw";

import { MOCK_VALUES } from "./constants";

type QueryHandler = (
  req: RestRequest,
  res: ResponseComposition,
  ctx: RestContext,
) => any;

interface QueryStrategy {
  pattern: RegExp | string;
  handler: QueryHandler;
}

const handleRewardGauges: QueryHandler = (req, res, ctx) => {
  try {
    const mockResponse = incentivequery.QueryRewardGaugesResponse.fromPartial({
      rewardGauges: {
        BTC_STAKER: {
          coins: [{ amount: MOCK_VALUES.REWARDS, denom: "ubbn" }],
          withdrawnCoins: [],
        },
      },
    });

    const encoded =
      incentivequery.QueryRewardGaugesResponse.encode(mockResponse).finish();

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
    console.error("Failed to build mock RewardGauges response", error);
    return req.passthrough();
  }
};

const handleBankBalance: QueryHandler = (req, res, ctx) => {
  try {
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
};

const queryStrategies: QueryStrategy[] = [
  {
    pattern:
      /(babylon\.incentive\.v1\.Query\/RewardGauges|babylon\.incentive\.Query\/RewardGauges)/,
    handler: handleRewardGauges,
  },
  {
    pattern: /cosmos\.bank\.v1beta1\.Query\/Balance/,
    handler: handleBankBalance,
  },
];

export const blockchainHandlers = [
  rest.get(/.*\/abci_query$/, (req, res, ctx) => {
    const url = new URL(req.url.href);
    let pathParam = url.searchParams.get("path");

    if (pathParam) {
      if (pathParam.startsWith("%22") || pathParam.startsWith('"')) {
        try {
          pathParam = decodeURIComponent(pathParam);
        } catch (_) {}
        pathParam = pathParam.replace(/^\"|\"$/g, "");
      }
    }

    if (pathParam) {
      for (const strategy of queryStrategies) {
        if (
          typeof strategy.pattern === "string"
            ? pathParam.includes(strategy.pattern)
            : strategy.pattern.test(pathParam)
        ) {
          return strategy.handler(req, res, ctx);
        }
      }
    }

    return req.passthrough();
  }),
];
