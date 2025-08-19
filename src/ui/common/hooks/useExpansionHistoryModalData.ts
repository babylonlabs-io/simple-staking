import { useMemo } from "react";

import { useExpansionHistoryService } from "@/ui/common/hooks/services/useExpansionHistoryService";
import { useFinalityProviderState } from "@/ui/common/state/FinalityProviderState";
import {
  DelegationV2,
  DelegationWithFP,
} from "@/ui/common/types/delegationsV2";
import { transformDelegationToActivityCard } from "@/ui/common/utils/activityCardTransformers";

import { ActivityCardData } from "../components/ActivityCard/ActivityCard";

export interface UseExpansionHistoryModalDataProps {
  targetDelegation: DelegationWithFP | null;
  allDelegations: DelegationV2[];
}

export interface UseExpansionHistoryModalDataReturn {
  expansionChain: DelegationV2[];
  activityCards: ActivityCardData[];
  hasExpansionHistory: boolean;
}

export function useExpansionHistoryModalData({
  targetDelegation,
  allDelegations,
}: UseExpansionHistoryModalDataProps): UseExpansionHistoryModalDataReturn {
  const { getExpansionChain } = useExpansionHistoryService();
  const { finalityProviderMap } = useFinalityProviderState();

  const expansionChain = useMemo(() => {
    if (!targetDelegation || !allDelegations) return [];
    return getExpansionChain(allDelegations, targetDelegation.stakingTxHashHex);
  }, [targetDelegation, allDelegations, getExpansionChain]);

  const activityCards = useMemo(() => {
    // Show only expansion history (exclude the target delegation itself)
    const historyChain = expansionChain.slice(0, -1);

    return historyChain.map((delegation, index) => {
      const stepLabel = index === 0 ? "Original Stake" : `Expansion ${index}`;
      // Options for expansion history: no actions, no expansion section, hide expansion completely
      const options = {
        showActions: false,
        showExpansionSection: false,
        hideExpansionCompletely: true,
      };
      return transformDelegationToActivityCard(
        delegation,
        finalityProviderMap,
        options,
        stepLabel,
      );
    });
  }, [expansionChain, finalityProviderMap]);

  const hasExpansionHistory = expansionChain.length > 0;

  return {
    expansionChain,
    activityCards,
    hasExpansionHistory,
  };
}
