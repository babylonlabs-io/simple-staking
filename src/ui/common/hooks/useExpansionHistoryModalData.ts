import { useMemo } from "react";

import { useExpansionHistoryService } from "@/ui/common/hooks/services/useExpansionHistoryService";
import { useFinalityProviderState } from "@/ui/common/state/FinalityProviderState";
import {
  DelegationV2,
  DelegationWithFP,
} from "@/ui/common/types/delegationsV2";
import { transformDelegationToActivityCard } from "@/ui/common/utils/delegationTransformers";

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
    return expansionChain.map((delegation, index) => {
      const finalityProvider = finalityProviderMap.get(
        delegation.finalityProviderBtcPksHex[0],
      );
      return transformDelegationToActivityCard(
        delegation,
        finalityProvider,
        index,
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
