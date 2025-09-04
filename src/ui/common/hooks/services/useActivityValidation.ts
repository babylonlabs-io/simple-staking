import { useMemo } from "react";

import { DelegationV2 } from "@/ui/common/types/delegationsV2";
import { isValidBroadcastedExpansion } from "@/ui/common/utils/stakingExpansionValidation";

/**
 * Hook for validating delegations in the Activity tab.
 * Handles both regular UTXO validation and special cases for VERIFIED broadcasted expansions.
 *
 * @param delegations - The raw delegations from the delegation service
 * @param validations - The validation results from useUtxoValidation
 * @param publicKeyNoCoord - The user's public key for localStorage access
 * @returns Filtered array of delegations that should be considered for display
 */
export function useActivityValidation(
  delegations: DelegationV2[],
  validations: Record<string, { valid: boolean }>,
  publicKeyNoCoord: string | undefined,
): DelegationV2[] {
  return useMemo(() => {
    return delegations.filter((delegation) => {
      const validation = validations[delegation.stakingTxHashHex];
      const { valid } = validation || { valid: false };

      // Include if it passes regular UTXO validation
      if (valid) return true;

      // Special case: Include VERIFIED broadcasted expansions even without valid UTXOs
      // This is because expansions are broadcasted but not yet confirmed on Bitcoin,
      // so they don't have valid UTXOs yet but should still be shown in Activity tab
      if (isValidBroadcastedExpansion(delegation, publicKeyNoCoord)) {
        return true;
      }

      return false;
    });
  }, [delegations, validations, publicKeyNoCoord]);
}
