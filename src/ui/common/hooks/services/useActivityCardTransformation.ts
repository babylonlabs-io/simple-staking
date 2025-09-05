import { useMemo } from "react";

import { getActionButton } from "@/ui/common/components/ActivityCard/utils/actionButtonUtils";
import {
  ActivityCardTransformOptions,
  transformDelegationToActivityCard,
} from "@/ui/common/components/ActivityCard/utils/activityCardTransformers";
import { useBTCWallet } from "@/ui/common/context/wallet/BTCWalletProvider";
import { ActionType } from "@/ui/common/hooks/services/useDelegationService";
import { useExpansionVisibilityService } from "@/ui/common/hooks/services/useExpansionVisibilityService";
import {
  DelegationV2,
  DelegationWithFP,
} from "@/ui/common/types/delegationsV2";
import { FinalityProvider } from "@/ui/common/types/finalityProviders";

export interface ActivityCardData
  extends ReturnType<typeof transformDelegationToActivityCard> {
  primaryAction?: ReturnType<typeof getActionButton>;
}

/**
 * Hook for transforming delegations into activity card data.
 * Handles transformation to card format and addition of action buttons.
 *
 * @param delegations - The validated delegations to transform
 * @param finalityProviderMap - Map of finality providers for FP lookup
 * @param openConfirmationModal - Function to open confirmation modal
 * @param isStakingManagerReady - Whether staking manager is ready for actions
 * @returns Array of transformed activity card data
 */
export function useActivityCardTransformation(
  delegations: DelegationV2[],
  finalityProviderMap: Map<string, FinalityProvider>,
  openConfirmationModal: (
    action: ActionType,
    delegation: DelegationWithFP,
  ) => void,
  isStakingManagerReady: boolean,
): ActivityCardData[] {
  const { publicKeyNoCoord } = useBTCWallet();
  const { isBroadcastedExpansion } =
    useExpansionVisibilityService(publicKeyNoCoord);

  return useMemo(() => {
    return delegations.map((delegation) => {
      // Check if this delegation is a broadcasted expansion
      const isBroadcasted = isBroadcastedExpansion(delegation);

      // Transform delegation to activity card format
      const options: ActivityCardTransformOptions = {
        showExpansionSection: true,
        isBroadcastedExpansion: isBroadcasted,
      };
      const cardData = transformDelegationToActivityCard(
        delegation,
        finalityProviderMap,
        options,
      );

      // Create delegation with FP for action button logic
      // Use the first FP [0] for backward compatibility with action button logic
      // which expects a single FP to determine button state. The full BSN/FP pairs
      // are properly displayed in the card's grouped details section
      const delegation_v2 = delegation as DelegationV2;
      const fp =
        Array.isArray(delegation_v2.finalityProviderBtcPksHex) &&
        delegation_v2.finalityProviderBtcPksHex.length > 0
          ? finalityProviderMap.get(delegation_v2.finalityProviderBtcPksHex[0])
          : undefined;

      const delegationWithFP: DelegationWithFP = {
        ...delegation_v2,
        fp,
      } as DelegationWithFP;

      // Add action button if applicable
      const primaryAction = getActionButton(
        delegationWithFP,
        openConfirmationModal,
        isStakingManagerReady,
        isBroadcasted,
      );

      return {
        ...cardData,
        primaryAction,
      };
    });
  }, [
    delegations,
    finalityProviderMap,
    openConfirmationModal,
    isStakingManagerReady,
    isBroadcastedExpansion,
  ]);
}
