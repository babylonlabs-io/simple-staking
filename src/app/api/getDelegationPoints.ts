import { encode } from "url-safe-base64";

import { Pagination } from "../types/api";

import { apiWrapper } from "./apiWrapper";

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

// Get delegation points by staker BTC public key
export const getDelegationPointsByStakerBtcPk = async (
  stakerBtcPk: string,
  paginationKey?: string,
): Promise<PaginatedDelegationsPoints> => {
  const params: Record<string, string> = {
    staker_btc_pk: encode(stakerBtcPk),
  };

  if (paginationKey && paginationKey !== "") {
    params.pagination_key = encode(paginationKey);
  }

  const response = await apiWrapper(
    "GET",
    process.env.NEXT_PUBLIC_POINTS_API_URL || "",
    "/v1/points/staker/delegations",
    "Error getting delegation points by staker BTC public key",
    params,
  );

  return {
    data: response.data.data,
    pagination: response.data.pagination,
  };
};

// Get delegation points by staking transaction hash hex
export const getDelegationPointsByStakingTxHashHexes = async (
  stakingTxHashHexes: string[],
): Promise<DelegationsPoints> => {
  const response = await apiWrapper(
    "POST",
    process.env.NEXT_PUBLIC_POINTS_API_URL || "",
    "/v1/points/delegations",
    "Error getting delegation points by staking transaction hashes",
    { staking_tx_hash_hex: stakingTxHashHexes },
  );

  return {
    data: response.data,
  };
};
