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

export const getDelegationPoints = async (
  paginationKey?: string,
  stakerBtcPk?: string,
  stakingTxHashHexes?: string[],
): Promise<PaginatedDelegationsPoints> => {
  const params: Record<string, string | string[]> = {};

  if (stakerBtcPk && stakingTxHashHexes && stakingTxHashHexes.length > 0) {
    throw new Error(
      "Only one of stakerBtcPk or stakingTxHashHexes should be provided",
    );
  }

  if (
    !stakerBtcPk &&
    (!stakingTxHashHexes || stakingTxHashHexes.length === 0)
  ) {
    throw new Error(
      "Either stakerBtcPk or stakingTxHashHexes must be provided",
    );
  }

  if (stakerBtcPk) {
    params.staker_btc_pk = encode(stakerBtcPk);
  }

  let allDelegationPoints: DelegationPoints[] = [];
  let nextPaginationKey = paginationKey;

  do {
    const currentParams = { ...params };
    if (nextPaginationKey && nextPaginationKey !== "") {
      currentParams.pagination_key = encode(nextPaginationKey);
    }

    if (stakingTxHashHexes && stakingTxHashHexes.length > 0) {
      currentParams.staking_tx_hash_hex = stakingTxHashHexes.slice(0, 10);
      stakingTxHashHexes = stakingTxHashHexes.slice(10);
    }

    const response = await apiWrapper(
      "GET",
      "/v1/points/staker/delegations",
      "Error getting delegation points",
      currentParams,
    );

    allDelegationPoints = allDelegationPoints.concat(response.data.data);
    nextPaginationKey = response.data.pagination.next_key;
  } while (
    nextPaginationKey ||
    (stakingTxHashHexes && stakingTxHashHexes.length > 0)
  );

  return {
    data: allDelegationPoints,
    pagination: { next_key: nextPaginationKey || "" },
  };
};
