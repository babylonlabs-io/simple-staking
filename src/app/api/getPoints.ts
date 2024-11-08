import { encode } from "url-safe-base64";

import { Pagination } from "../types/api";

import { pointsApiWrapper } from "./pointsApiWrapper";

interface StakerPointsAPIResponse {
  data: StakerPointsAPI[];
}

export interface StakerPointsAPI {
  staker_btc_pk: string;
  points: number;
}

export interface DelegationPointsAPI {
  staking_tx_hash_hex: string;
  staker: {
    pk: string;
    points: number;
  };
  finality_provider: {
    pk: string;
    points: number;
  };
  staking_height: number;
  unbonding_height: number | null;
  expiry_height: number;
}

interface PaginatedDelegationsPointsAPIResponse {
  data: DelegationPointsAPI[];
  pagination: Pagination;
}

export const getStakersPoints = async (
  stakerBtcPks: string[],
): Promise<StakerPointsAPI[]> => {
  const params = new URLSearchParams();

  stakerBtcPks.forEach((pk) => {
    params.append("staker_btc_pk", encode(pk));
  });

  const response = await pointsApiWrapper(
    "GET",
    "/v1/points/stakers",
    "Error getting staker points",
    params,
  );

  const responseData: StakerPointsAPIResponse = response.data;
  return responseData.data;
};

// Get delegation points by staking transaction hash hex
export const getDelegationPointsByStakingTxHashHexes = async (
  stakingTxHashHexes: string[],
): Promise<DelegationPointsAPI[]> => {
  try {
    const response = await pointsApiWrapper(
      "POST",
      "/v1/points/delegations",
      "Error getting delegation points by staking transaction hashes",
      { staking_tx_hash_hex: stakingTxHashHexes },
    );

    const responseData: PaginatedDelegationsPointsAPIResponse = response.data;
    return responseData.data;
  } catch (error) {
    throw error;
  }
};
