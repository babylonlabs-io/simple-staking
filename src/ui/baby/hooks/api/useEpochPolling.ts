import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef } from "react";

import { getCurrentBabylonEpoch } from "@/ui/common/api/getCurrentEpoch";
import { ONE_MINUTE } from "@/ui/common/constants";

import { usePendingOperationsService } from "../services/usePendingOperationsService";

import { BABY_DELEGATIONS_KEY } from "./useDelegations";
import { BABY_UNBONDING_DELEGATIONS_KEY } from "./useUnbondingDelegations";

const BABYLON_CURRENT_EPOCH_KEY = "BABYLON_CURRENT_EPOCH";

export function useEpochPolling(address?: string) {
  const queryClient = useQueryClient();
  const previousEpochRef = useRef<number | undefined>(undefined);
  const { cleanupAllPendingOperationsFromStorage } =
    usePendingOperationsService();

  const { data: currentEpoch } = useQuery<number, Error>({
    queryKey: [BABYLON_CURRENT_EPOCH_KEY],
    queryFn: () => getCurrentBabylonEpoch(),
    refetchInterval: ONE_MINUTE,
    // Only poll if we have an address (user is connected)
    enabled: Boolean(address),
  });

  useEffect(() => {
    if (currentEpoch === undefined) return;

    if (previousEpochRef.current === undefined) {
      previousEpochRef.current = currentEpoch;
      return;
    }

    if (currentEpoch !== previousEpochRef.current) {
      // Clean up all pending operations from localStorage (everything from
      // previous epochs is finalized)
      cleanupAllPendingOperationsFromStorage();

      // Invalidate all delegation queries since epoch change affects entire
      // blockchain state
      queryClient.invalidateQueries({
        queryKey: [BABY_DELEGATIONS_KEY],
      });
      // Also invalidate unbonding delegations since they're epoch-dependent
      queryClient.invalidateQueries({
        queryKey: [BABY_UNBONDING_DELEGATIONS_KEY],
      });
      previousEpochRef.current = currentEpoch;
    }
  }, [
    currentEpoch,
    queryClient,
    address,
    cleanupAllPendingOperationsFromStorage,
  ]);
}
