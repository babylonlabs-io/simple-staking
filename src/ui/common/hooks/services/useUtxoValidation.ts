import { useMemo } from "react";

import { useAppState } from "@/ui/common/state";
import { DelegationV2 } from "@/ui/common/types/delegationsV2";
import { validateDelegation } from "@/ui/common/utils/delegations";

/**
 * Hook for validating delegation transactions against available UTXOs.
 * Returns a validation map for all provided delegations.
 */
export function useUtxoValidation(delegations: DelegationV2[]) {
  const { availableUTXOs = [] } = useAppState();

  const validationMap = useMemo(() => {
    const map: Record<string, { valid: boolean; error?: string }> = {};

    delegations.forEach((delegation) => {
      const validation = validateDelegation(delegation, availableUTXOs);
      map[delegation.stakingTxHashHex] = validation;
    });

    return map;
  }, [delegations, availableUTXOs]);

  return validationMap;
}
