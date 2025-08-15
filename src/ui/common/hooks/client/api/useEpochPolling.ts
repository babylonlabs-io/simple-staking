import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef } from "react";

import { getCurrentEpoch } from "@/ui/common/api/getCurrentEpoch";
import { ONE_MINUTE } from "@/ui/common/constants";

import { DELEGATIONS_KEY } from "./useDelegations";

const CURRENT_EPOCH_KEY = "CURRENT_EPOCH";

export function useEpochPolling() {
  const queryClient = useQueryClient();
  const previousEpochRef = useRef<number | undefined>(undefined);

  const { data: currentEpoch } = useQuery<number, Error>({
    queryKey: [CURRENT_EPOCH_KEY],
    queryFn: () => getCurrentEpoch(),
    refetchInterval: ONE_MINUTE,
  });

  useEffect(() => {
    if (currentEpoch === undefined) return;

    if (previousEpochRef.current === undefined) {
      previousEpochRef.current = currentEpoch;
      return;
    }

    if (currentEpoch !== previousEpochRef.current) {
      queryClient.invalidateQueries({ queryKey: [DELEGATIONS_KEY] });
      previousEpochRef.current = currentEpoch;
    }
  }, [currentEpoch, queryClient]);
}
