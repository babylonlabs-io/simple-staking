import { useQuery } from "@tanstack/react-query";
import React, { ReactNode, createContext, useContext, useEffect } from "react";

import { getStats } from "@/app/api/getStats";
import {
  API_DEFAULT_RETRY_COUNT,
  API_DEFAULT_RETRY_DELAY,
  ONE_SECOND,
} from "@/app/constants";
import { useLogger } from "@/hooks/useLogger";

import { useError } from "../Error/ErrorProvider";
export interface StakingStats {
  activeTVLSat: number;
  totalTVLSat: number;
  activeDelegations: number;
  totalDelegations: number;
  totalStakers: number;
  unconfirmedTVLSat: number;
}

interface StakingStatsProviderProps {
  children: ReactNode;
}

interface StakingStatsContextType {
  data: StakingStats | undefined;
  isLoading: boolean;
}

const defaultContextValue: StakingStatsContextType = {
  data: undefined,
  isLoading: true,
};

const StakingStatsContext =
  createContext<StakingStatsContextType>(defaultContextValue);

export const StakingStatsProvider: React.FC<StakingStatsProviderProps> = ({
  children,
}) => {
  const { isOpen, handleError } = useError();
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["API_STATS"],
    queryFn: async () => getStats(),
    refetchInterval: 60000, // 1 minute
    retry: (failureCount) => !isOpen && failureCount < API_DEFAULT_RETRY_COUNT,
    retryDelay: (count) => API_DEFAULT_RETRY_DELAY ** (count + 1) * ONE_SECOND,
  });
  const logger = useLogger();

  useEffect(() => {
    if (isError && error) {
      logger.error(error);
      handleError({
        error,
        displayOptions: {
          retryAction: refetch,
        },
      });
    }
  }, [isError, error, handleError, refetch, logger]);

  return (
    <StakingStatsContext.Provider value={{ data, isLoading }}>
      {children}
    </StakingStatsContext.Provider>
  );
};

// Custom hook to use the staking stats
export const useStakingStats = () => useContext(StakingStatsContext);
