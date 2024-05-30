import { StakingStats } from "../types/stakingStats";

import { apiWrapper } from "./apiWrapper";

interface StatsAPIResponse {
  data: StatsAPI;
}

interface StatsAPI {
  active_tvl: number;
  total_tvl: number;
  active_delegations: number;
  total_delegations: number;
  total_stakers: number;
  unconfirmed_tvl: number;
}

export const getStats = async (): Promise<StakingStats> => {
  const response = await apiWrapper("GET", "/v1/stats", "Error getting stats");
  const statsAPIResponse: StatsAPIResponse = response.data;
  const statsAPI: StatsAPI = statsAPIResponse.data;

  return {
    activeTVLSat: statsAPI.active_tvl,
    totalTVLSat: statsAPI.total_tvl,
    activeDelegations: statsAPI.active_delegations,
    totalDelegations: statsAPI.total_delegations,
    totalStakers: statsAPI.total_stakers,
    unconfirmedTVLSat: statsAPI.unconfirmed_tvl,
  };
};
