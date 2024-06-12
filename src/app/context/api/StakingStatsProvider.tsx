import { useQuery } from "@tanstack/react-query";
import React, { ReactNode, createContext, useContext, useEffect } from "react";

import { getStats } from "@/app/api/getStats";
import { ErrorState } from "@/app/types/errors";

import { useError } from "../Error/ErrorContext";

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
  const { isErrorOpen, showError } = useError();
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["API_STATS"],
    queryFn: async () => getStats(),
    refetchInterval: 60000, // 1 minute
    retry: (failureCount) => {
      return !isErrorOpen && failureCount <= 3;
    },
  });

  useEffect(() => {
    if (isError && error) {
      showError({
        error: {
          message: error.message,
          errorState: ErrorState.SERVER_ERROR,
          errorTime: new Date(),
        },
        retryAction: refetch,
      });
    }
  }, [isError, error, showError, refetch]);

  return (
    <StakingStatsContext.Provider value={{ data, isLoading }}>
      {children}
    </StakingStatsContext.Provider>
  );
};

// Custom hook to use the staking stats
export const useStakingStats = () => useContext(StakingStatsContext);
