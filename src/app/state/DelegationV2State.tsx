import { useCallback, useMemo, type PropsWithChildren } from "react";
import { useLocalStorage } from "usehooks-ts";

import { useBTCWallet } from "@/app/context/wallet/BTCWalletProvider";
import type { DelegationV2 } from "@/app/types/delegationsV2";
import { createStateUtils } from "@/utils/createStateUtils";
import { getDelegationsV2LocalStorageKey } from "@/utils/local_storage/getDelegationsLocalStorageKey";

import { useDelegationsV2 } from "../hooks/api/useDelegationsV2";

interface DelegationV2State {
  isLoading: boolean;
  hasMoreDelegations: boolean;
  delegations: DelegationV2[];
  addDelegation: (delegation: DelegationV2) => void;
  fetchMoreDelegations: () => void;
  findDelegationByTxHash: (txHash: string) => DelegationV2 | undefined;
}

const { StateProvider, useState } = createStateUtils<DelegationV2State>({
  isLoading: false,
  delegations: [],
  hasMoreDelegations: false,
  addDelegation: () => null,
  fetchMoreDelegations: () => null,
  findDelegationByTxHash: () => undefined,
});

export function DelegationV2State({ children }: PropsWithChildren) {
  const { publicKeyNoCoord } = useBTCWallet();
  const { data, fetchNextPage, isFetchingNextPage, hasNextPage } =
    useDelegationsV2();

  // States
  const [delegations, setDelegations] = useLocalStorage<DelegationV2[]>(
    getDelegationsV2LocalStorageKey(publicKeyNoCoord),
    [],
  );

  // // Effects
  // useEffect(
  //   function syncDelegations() {
  //     if (!data?.delegations) {
  //       return;
  //     }
  //     // TODO: Find the difference and update only the difference
  //     if (!areDelegationsEqual(delegations, data.delegations)) {
  //       setDelegations(data.delegations);
  //     }
  //   },
  //   [data?.delegations, delegations, setDelegations],
  // );

  // Methods
  const addDelegation = useCallback(
    (newDelegation: DelegationV2) => {
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

  // Get a delegation by its txHash
  const findDelegationByTxHash = useCallback(
    (txHash: string) => delegations.find((d) => d.stakingTxHashHex === txHash),
    [delegations],
  );

  console.log(delegations, data?.delegations);

  // Context
  const state = useMemo(
    () => ({
      delegations: data?.delegations ?? [],
      isLoading: isFetchingNextPage,
      hasMoreDelegations: hasNextPage,
      addDelegation,
      findDelegationByTxHash,
      fetchMoreDelegations: fetchNextPage,
    }),
    [
      data?.delegations,
      isFetchingNextPage,
      hasNextPage,
      addDelegation,
      fetchNextPage,
      findDelegationByTxHash,
    ],
  );

  return <StateProvider value={state}>{children}</StateProvider>;
}

export const useDelegationV2State = useState;

function areDelegationsEqual(
  arr1: DelegationV2[],
  arr2: DelegationV2[],
): boolean {
  if (arr1.length !== arr2.length) return false;

  return arr1.every((item, index) => {
    const other = arr2[index];
    return (
      item.stakingTxHashHex === other.stakingTxHashHex &&
      item.state === other.state
    );
  });
}
