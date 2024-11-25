import { apiWrapper } from "./apiWrapper";

export interface SystemStats {
  active_tvl: number;
  total_tvl: number;
  active_delegations: number;
  total_delegations: number;
  active_stakers: number;
  total_stakers: number;
  active_finality_providers: number;
  total_finality_providers: number;
}

interface SystemStatsAPIResponse {
  data: SystemStats;
}

export const getSystemStats = async (): Promise<SystemStats> => {
  const response = await apiWrapper(
    "GET",
    "/v2/stats",
    "Error getting system stats",
  );

  const systemStatsAPIResponse: SystemStatsAPIResponse = response.data;

  return systemStatsAPIResponse.data;
};
