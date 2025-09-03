import { useMemo } from "react";

import { DelegationV2 } from "@/ui/common/types/delegationsV2";

import { useExpansionConflictValidation } from "./useExpansionConflictValidation";
import { useUtxoValidation } from "./useUtxoValidation";

/**
 * Combined hook for validating delegations.
 * Performs both UTXO validation and expansion conflict detection.
 * Returns a unified validation map for all provided delegations.
 */
export function useDelegationValidation(
  delegations: (DelegationV2 & { _isFromAPI?: boolean })[],
) {
  // Get UTXO validation results
  const utxoValidation = useUtxoValidation(delegations);

  // Get expansion conflict validation results
  const conflictValidation = useExpansionConflictValidation(delegations);

  // Merge validation results
  const validationMap = useMemo(() => {
    const map: Record<string, { valid: boolean; error?: string }> = {};

    delegations.forEach((delegation) => {
      const txHash = delegation.stakingTxHashHex;
      const utxoResult = utxoValidation[txHash];
      const conflictResult = conflictValidation[txHash];

      // If either validation fails, the delegation is invalid
      if (!utxoResult.valid) {
        map[txHash] = utxoResult;
      } else if (!conflictResult.valid) {
        map[txHash] = conflictResult;
      } else {
        map[txHash] = { valid: true };
      }
    });

    return map;
  }, [delegations, utxoValidation, conflictValidation]);

  return validationMap;
}
