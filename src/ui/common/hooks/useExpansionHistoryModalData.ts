import { useMemo } from "react";

import { transformDelegationToActivityCard } from "@/ui/common/components/ActivityCard/utils/activityCardTransformers";
import { useExpansionHistoryService } from "@/ui/common/hooks/services/useExpansionHistoryService";
import { useFinalityProviderState } from "@/ui/common/state/FinalityProviderState";
import {
  DelegationV2,
  DelegationWithFP,
} from "@/ui/common/types/delegationsV2";

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

    // Reverse the array to show newest first (most recent expansion → original stake)
    const reversedHistoryChain = [...historyChain].reverse();

    return reversedHistoryChain.map((delegation, index) => {
      const totalExpansions = historyChain.length;
      const stepLabel =
        index === totalExpansions - 1
          ? "Original Stake"
          : `Expansion ${totalExpansions - index - 1}`;
      // Options for expansion history: no expansion section, hide expansion completely
      const options = {
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
