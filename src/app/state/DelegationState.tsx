import { useCallback, useEffect, useMemo, type PropsWithChildren } from "react";
import { useLocalStorage } from "usehooks-ts";

import { useBTCWallet } from "@/app/context/wallet/BTCWalletProvider";
import { useDelegations } from "@/app/hooks/client/api/useDelegations";
import type { Delegation } from "@/app/types/delegations";
import { createStateUtils } from "@/utils/createStateUtils";
import { calculateDelegationsDiff } from "@/utils/local_storage/calculateDelegationsDiff";
import { getDelegationsLocalStorageKey as getDelegationsKey } from "@/utils/local_storage/getDelegationsLocalStorageKey";

interface DelegationState {
  isLoading: boolean;
  hasMoreDelegations: boolean;
  delegations: Delegation[];
  addDelegation: (delegation: Delegation) => void;
  fetchMoreDelegations: () => void;
}

const { StateProvider, useState } = createStateUtils<DelegationState>({
  isLoading: false,
  delegations: [],
  hasMoreDelegations: false,
  addDelegation: () => null,
  fetchMoreDelegations: () => null,
});

export function DelegationState({ children }: PropsWithChildren) {
  const { publicKeyNoCoord } = useBTCWallet();
  const { data, fetchNextPage, isFetchingNextPage, hasNextPage } =
    useDelegations();

  // States
  const [delegations, setDelegations] = useLocalStorage<Delegation[]>(
    getDelegationsKey(publicKeyNoCoord),
    [],
  );

  useEffect(
    function syncDelegations() {
      if (!data?.delegations) {
        return;
      }

      const updateDelegations = async () => {
        const { areDelegationsDifferent, delegations: newDelegations } =
          await calculateDelegationsDiff(data.delegations, delegations);
        if (areDelegationsDifferent) {
          setDelegations(newDelegations);
        }
      };

      updateDelegations();
    },
    [data?.delegations, setDelegations, delegations],
  );

  // Methods
  const addDelegation = useCallback(
    (newDelegation: Delegation) => {
      setDelegations((delegations) => {
        const exists = delegations.some(
          (delegation) =>
            delegation.stakingTxHashHex === newDelegation.stakingTxHashHex,
        );

        if (!exists) {
          return [newDelegation, ...delegations];
        }

        return delegations;
      });
    },
    [setDelegations],
  );

  // Context
  const state = useMemo(
    () => ({
      delegations,
      isLoading: isFetchingNextPage,
      hasMoreDelegations: hasNextPage,
      addDelegation,
      fetchMoreDelegations: fetchNextPage,
    }),
    [
      delegations,
      isFetchingNextPage,
      hasNextPage,
      addDelegation,
      fetchNextPage,
    ],
  );

  return <StateProvider value={state}>{children}</StateProvider>;
}

export const useDelegationState = useState;
