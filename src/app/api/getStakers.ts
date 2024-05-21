import { apiWrapper } from "./apiWrapper";

export interface Stakers {
  stakers: StakersAPI[];
}

export interface StakersAPI {
  staker_pk_hex: string;
  active_tvl: number;
  total_tvl: number;
  active_delegations: number;
  total_delegations: number;
}

interface StakersAPIResponse {
  data: StakersAPI[];
}

export const getStakers = async (): Promise<Stakers> => {
  try {
    // Intentionally used without pagination for now
    const limit = 50;
    // const reverse = false;

    const params = {
      // "pagination_key": encode(key),
      // "pagination_reverse": reverse,
      pagination_limit: limit,
    };

    const response = await apiWrapper(
      "GET",
      "/v1/stats/staker",
      "Error getting stakers",
      params,
    );

    const stakersAPIResponse: StakersAPIResponse = response.data;
    const stakersAPI: StakersAPI[] = stakersAPIResponse.data;

    return {
      stakers: stakersAPI,
    };
  } catch (error) {
    throw error;
  }
};
