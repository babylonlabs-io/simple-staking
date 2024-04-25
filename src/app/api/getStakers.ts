import { encode } from "url-safe-base64";

import { apiWrapper } from "./apiWrapper";

export interface Stakers {
  data: StakersData[];
  pagination: Pagination;
}

export interface StakersData {
  staker_pk_hex: string;
  active_tvl: number;
  total_tvl: number;
  active_delegations: number;
  total_delegations: number;
}

export interface Pagination {
  next_key: string;
}

export const getStakers = async (key: string): Promise<Stakers> => {
  const limit = 10;
  const reverse = false;

  const params = {
    "pagination.key": encode(key),
    "pagination.reverse": reverse,
    "pagination.limit": limit,
  };

  const response = await apiWrapper(
    "GET",
    "/v1/stats/staker",
    "Error getting stakers",
    params,
  );

  return response.data;
};
