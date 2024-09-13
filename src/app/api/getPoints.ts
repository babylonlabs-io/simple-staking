import { encode } from "url-safe-base64";

import { Pagination } from "../types/api";

import { pointsApiWrapper } from "./pointsApiWrapper";

export interface StakerPoints {
  staker_btc_pk: string;
  points: number;
}

export interface DelegationPoints {
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

export interface PaginatedDelegationsPoints {
  data: DelegationPoints[];
  pagination: Pagination;
}

export interface DelegationsPoints {
  data: DelegationPoints[];
}

export const getStakersPoints = async (
  stakerBtcPks: string[],
): Promise<StakerPoints[]> => {
  const params: Record<string, string> = {};

  params.staker_btc_pk =
    stakerBtcPks.length > 1
      ? stakerBtcPks.map(encode).join(",")
      : encode(stakerBtcPks[0]);

  const response = await pointsApiWrapper(
    "GET",
    "/v1/points/stakers",
    "Error getting staker points",
    params,
  );

  return response.data;
};

// Get delegation points by staking transaction hash hex
export const getDelegationPointsByStakingTxHashHexes = async (
  stakingTxHashHexes: string[],
): Promise<DelegationsPoints> => {
  const response = await pointsApiWrapper(
    "POST",
    "/v1/points/delegations",
    "Error getting delegation points by staking transaction hashes",
    { staking_tx_hash_hex: stakingTxHashHexes },
  );

  return {
    data: response.data,
  };
};
