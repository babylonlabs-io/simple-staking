import { useCallback, useEffect, useMemo, type PropsWithChildren } from "react";
import { useLocalStorage } from "usehooks-ts";

import { useBTCWallet } from "@/app/context/wallet/BTCWalletProvider";
import { useDelegations } from "@/app/hooks/api/useDelegations";
import type { Delegation } from "@/app/types/delegations";
import { DelegationState as DelegationEnum } from "@/app/types/delegations";
import { createStateUtils } from "@/utils/createStateUtils";
import { calculateDelegationsDiff } from "@/utils/local_storage/calculateDelegationsDiff";
import { getDelegationsLocalStorageKey as getDelegationsKey } from "@/utils/local_storage/getDelegationsLocalStorageKey";

interface DelegationState {
  isLoading: boolean;
  hasMoreDelegations: boolean;
  totalStaked: number;
  delegations: Delegation[];
  addDelegation: (delegation: Delegation) => void;
  fetchMoreDelegations: () => void;
}

const { StateProvider, useState } = createStateUtils<DelegationState>({
  isLoading: false,
  delegations: [],
  totalStaked: 0,
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

  // Effects
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

  // Computed
  const totalStaked = useMemo(
    () =>
      (data?.delegations ?? [])
        .filter((delegation) => delegation?.state === DelegationEnum.ACTIVE)
        .reduce(
          (accumulator: number, item) => accumulator + item?.stakingValueSat,
          0,
        ),
    [data?.delegations],
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
      totalStaked,
      isLoading: isFetchingNextPage,
      hasMoreDelegations: hasNextPage,
      addDelegation,
      fetchMoreDelegations: fetchNextPage,
    }),
    [
      delegations,
      totalStaked,
      isFetchingNextPage,
      hasNextPage,
      addDelegation,
      fetchNextPage,
    ],
  );

  return <StateProvider value={state}>{children}</StateProvider>;
}

export const useDelegationState = useState;
