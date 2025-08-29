import { useMemo } from "react";

import { useAppState } from "@/ui/common/state";
import { DelegationV2 } from "@/ui/common/types/delegationsV2";
import { validateDelegation } from "@/ui/common/utils/delegations";

/**
 * Hook for validating expansion transactions against available UTXOs.
 * Returns a validation map for all provided expansions.
 */
export function useExpansionValidation(expansions: DelegationV2[]) {
  const { availableUTXOs = [] } = useAppState();

  const validationMap = useMemo(() => {
    const map: Record<string, { valid: boolean; error?: string }> = {};

    expansions.forEach((expansion) => {
      const validation = validateDelegation(expansion, availableUTXOs);
      map[expansion.stakingTxHashHex] = validation;
    });

    return map;
  }, [expansions, availableUTXOs]);

  return validationMap;
}
