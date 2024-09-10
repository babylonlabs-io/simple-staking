import { encode } from "url-safe-base64";

import { apiWrapper } from "./apiWrapper";

export interface StakerPoints {
  staker_btc_pk: string;
  points: number;
}

export const getStakersPoints = async (
  stakerBtcPk: string[],
): Promise<StakerPoints[]> => {
  const params: Record<string, string> = {};

  params.staker_btc_pk =
    stakerBtcPk.length > 1
      ? stakerBtcPk.map(encode).join(",")
      : encode(stakerBtcPk[0]);

  const response = await apiWrapper(
    "GET",
    "/v1/points/stakers",
    "Error getting staker points",
    params,
  );

  return response.data;
};
