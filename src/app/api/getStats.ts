import { apiWrapper } from "./apiWrapper";

export interface Stats {
  data: StatsData;
}

export interface StatsData {
  active_tvl: number;
  total_tvl: number;
  active_delegations: number;
  total_delegations: number;
  total_stakers: number;
}

export const getStats = async (): Promise<Stats> => {
  const reponse = await apiWrapper("GET", "/v1/stats", "Error getting stats");
  return reponse.data;
};
