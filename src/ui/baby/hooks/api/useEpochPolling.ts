import { useQuery } from "@tanstack/react-query";
// import { useEffect, useRef } from "react";

import babylon from "@/infrastructure/babylon";
import { ONE_MINUTE } from "@/ui/common/constants";

// import { usePendingOperationsService } from "../services/usePendingOperationsService";

// import { BABY_DELEGATIONS_KEY } from "./useDelegations";
// import { BABY_UNBONDING_DELEGATIONS_KEY } from "./useUnbondingDelegations";

const BABYLON_CURRENT_EPOCH_KEY = "BABYLON_CURRENT_EPOCH";

export function useEpochPolling(address?: string) {
  // const queryClient = useQueryClient();
  // const previousEpochRef = useRef<number | undefined>(undefined);
  // const { cleanupAllPendingOperationsFromStorage } =
  //   usePendingOperationsService();

  // Use useQuery for caching and background updates
  const { data: currentEpoch } = useQuery<number, Error>({
    queryKey: [BABYLON_CURRENT_EPOCH_KEY],
    queryFn: async () => {
      const client = await babylon.client();
      const { currentEpoch } = await client.baby.getCurrentEpoch();
      return currentEpoch;
    },
    refetchInterval: ONE_MINUTE,
    enabled: Boolean(address),
    staleTime: ONE_MINUTE,
    refetchOnWindowFocus: false,
  });
  return currentEpoch;

  // Manual control for epoch change detection
  // useEffect(() => {
  //   if (currentEpoch === undefined) return;

  //   if (previousEpochRef.current === undefined) {
  //     previousEpochRef.current = currentEpoch;
  //     return;
  //   }

  //   if (currentEpoch !== previousEpochRef.current) {
  //     cleanupAllPendingOperationsFromStorage();

  //     queryClient.invalidateQueries({
  //       queryKey: [BABY_DELEGATIONS_KEY],
  //       refetchType: "active",
  //     });
  //     queryClient.invalidateQueries({
  //       queryKey: [BABY_UNBONDING_DELEGATIONS_KEY],
  //       refetchType: "active",
  //     });
  //     previousEpochRef.current = currentEpoch;
  //   }
  // }, [currentEpoch, queryClient, cleanupAllPendingOperationsFromStorage]);
}
