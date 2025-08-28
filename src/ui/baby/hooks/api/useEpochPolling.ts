import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef } from "react";

import babylon from "@/infrastructure/babylon";
import { ONE_MINUTE } from "@/ui/common/constants";

import { usePendingOperationsService } from "../services/usePendingOperationsService";

import { BABY_DELEGATIONS_KEY } from "./useDelegations";
import { BABY_UNBONDING_DELEGATIONS_KEY } from "./useUnbondingDelegations";

export function useEpochPolling(address?: string) {
  const queryClient = useQueryClient();
  const previousEpochRef = useRef<number | undefined>(undefined);
  const { cleanupAllPendingOperationsFromStorage } =
    usePendingOperationsService();
  const cleanupRef = useRef(cleanupAllPendingOperationsFromStorage);
  cleanupRef.current = cleanupAllPendingOperationsFromStorage;

  useEffect(() => {
    if (!address) return;

    let cancelled = false;

    const checkEpoch = async () => {
      try {
        const client = await babylon.client();
        const { currentEpoch } = await client.baby.getCurrentEpoch();

        if (previousEpochRef.current === undefined) {
          previousEpochRef.current = currentEpoch;
          return;
        }

        if (!cancelled && currentEpoch !== previousEpochRef.current) {
          cleanupRef.current?.();

          queryClient.invalidateQueries({
            queryKey: [BABY_DELEGATIONS_KEY],
            refetchType: "active",
          });
          queryClient.invalidateQueries({
            queryKey: [BABY_UNBONDING_DELEGATIONS_KEY],
            refetchType: "active",
          });
          previousEpochRef.current = currentEpoch;
        }
      } catch {
        // ignore transient errors
      }
    };

    checkEpoch();
    const id = setInterval(checkEpoch, ONE_MINUTE);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [address, queryClient]);
}
