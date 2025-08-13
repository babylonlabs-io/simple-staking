import { useCallback, useRef } from "react";

import { DelegationV2 } from "@/ui/common/types/delegationsV2";

export interface ExpansionHistoryData {
  historyCount: number;
  expansionChain: DelegationV2[];
}

export interface ExpansionHistoryCache {
  [txHashHex: string]: ExpansionHistoryData;
}

export function useExpansionHistoryService() {
  const cache = useRef<ExpansionHistoryCache>({});

  const buildExpansionChain = useCallback(
    (delegations: DelegationV2[], targetTxHash: string): DelegationV2[] => {
      const delegationMap = new Map<string, DelegationV2>();
      delegations.forEach((delegation) => {
        delegationMap.set(delegation.stakingTxHashHex, delegation);
      });

      const chain: DelegationV2[] = [];
      let currentTxHash = targetTxHash;

      while (currentTxHash) {
        const delegation = delegationMap.get(currentTxHash);
        if (!delegation) break;

        chain.unshift(delegation);
        currentTxHash = delegation.previousStakingTxHashHex || "";
      }

      return chain;
    },
    [],
  );

  const calculateExpansionHistory = useCallback(
    (
      delegations: DelegationV2[],
      targetTxHash: string,
    ): ExpansionHistoryData => {
      if (cache.current[targetTxHash]) {
        return cache.current[targetTxHash];
      }

      const expansionChain = buildExpansionChain(delegations, targetTxHash);
      const historyCount = Math.max(0, expansionChain.length - 1);

      const result: ExpansionHistoryData = {
        historyCount,
        expansionChain,
      };

      cache.current[targetTxHash] = result;
      return result;
    },
    [buildExpansionChain],
  );

  const getExpansionChain = useCallback(
    (delegations: DelegationV2[], targetTxHash: string): DelegationV2[] => {
      return calculateExpansionHistory(delegations, targetTxHash)
        .expansionChain;
    },
    [calculateExpansionHistory],
  );

  const getHistoryCount = useCallback(
    (delegations: DelegationV2[], targetTxHash: string): number => {
      return calculateExpansionHistory(delegations, targetTxHash).historyCount;
    },
    [calculateExpansionHistory],
  );

  const clearCache = useCallback(() => {
    cache.current = {};
  }, []);

  return {
    calculateExpansionHistory,
    getExpansionChain,
    getHistoryCount,
    clearCache,
  };
}
