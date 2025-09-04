import { useMemo } from "react";

import { useAppState } from "@/ui/common/state";
import {
  DelegationV2,
  DelegationV2StakingState,
} from "@/ui/common/types/delegationsV2";
import { validateDelegation } from "@/ui/common/utils/delegations";

/**
 * Hook for pure UTXO validation of delegation transactions.
 * Only checks if the required UTXOs are available for the transaction.
 * Returns a validation map for all provided delegations.
 */
export function useUtxoValidation(
  delegations: (DelegationV2 & { _isFromAPI?: boolean })[],
) {
  const { availableUTXOs = [] } = useAppState();

  const validationMap = useMemo(() => {
    const map: Record<string, { valid: boolean; error?: string }> = {};

    delegations.forEach((delegation) => {
      // Skip UTXO validation for broadcasted expansion transactions
      // They're already confirmed on-chain, so UTXO checks don't make sense
      if (
        delegation._isFromAPI &&
        delegation.previousStakingTxHashHex &&
        delegation.state === DelegationV2StakingState.VERIFIED
      ) {
        map[delegation.stakingTxHashHex] = { valid: true };
        return;
      }

      // Check UTXO validation
      const validation = validateDelegation(delegation, availableUTXOs);
      map[delegation.stakingTxHashHex] = validation;
    });

    return map;
  }, [delegations, availableUTXOs]);

  return validationMap;
}
