import { ClientError } from "@/ui/common/errors";
import { ERROR_CODES } from "@/ui/common/errors/codes";

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
  total_active_tvl: number;
  btc_staking_apr: number;
}

interface SystemStatsAPIResponse {
  data: SystemStats;
}

export const getSystemStats = async (): Promise<SystemStats> => {
  try {
    const response = await apiWrapper<SystemStatsAPIResponse>(
      "GET",
      "/v2/stats",
      "Error getting system stats",
    );

    const systemStatsAPIResponse: SystemStatsAPIResponse = response.data;

    return systemStatsAPIResponse.data;
  } catch (error) {
    throw new ClientError(
      ERROR_CODES.EXTERNAL_SERVICE_UNAVAILABLE,
      "Error getting system stats",
      {
        cause: error,
      },
    );
  }
};
