import { Page } from "@playwright/test";

import { finalityProviders } from "../mock/global/finalityProviders";
import { healthCheck } from "../mock/global/healthCheck";
import { fees as mainnetFees } from "../mock/mainnet/network/fees";
import { globalParams as mainnetGlobalParams } from "../mock/mainnet/network/globalParams";
import { stats as mainnetStats } from "../mock/mainnet/network/stats";
import { tipHeight as mainnetTipHeight } from "../mock/mainnet/network/tipHeight";
import { fees as signetFees } from "../mock/signet/network/fees";
import { globalParams as signetGlobalParams } from "../mock/signet/network/globalParams";
import { stats as signetStats } from "../mock/signet/network/stats";
import { tipHeight as signetTipHeight } from "../mock/signet/network/tipHeight";
import { NetworkType } from "../types/network";

import { interceptRequest } from "./interceptRequest";

export const mockNetwork = async (page: Page, network: NetworkType) => {
  const isOnMainnet = network === "mainnet";
  await interceptRequest(page, "**/healthcheck**", 200, healthCheck);
  await interceptRequest(
    page,
    "**/v1/finality-providers**",
    200,
    finalityProviders,
  );
  await interceptRequest(
    page,
    "**/fees/recommended**",
    200,
    isOnMainnet ? mainnetFees : signetFees,
  );
  await interceptRequest(
    page,
    "**/v1/global-params**",
    200,
    isOnMainnet ? mainnetGlobalParams : signetGlobalParams,
  );
  await interceptRequest(
    page,
    "**/v1/stats**",
    200,
    isOnMainnet ? mainnetStats : signetStats,
  );
  await interceptRequest(
    page,
    "**/tip/height**",
    200,
    isOnMainnet ? mainnetTipHeight : signetTipHeight,
  );
};
