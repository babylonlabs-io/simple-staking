import { useCallback, useMemo, type PropsWithChildren } from "react";

import { useBTCWallet } from "@/app/context/wallet/BTCWalletProvider";
import type { DelegationLike, DelegationV2 } from "@/app/types/delegationsV2";
import { createStateUtils } from "@/utils/createStateUtils";
import { getDelegationsV2LocalStorageKey } from "@/utils/local_storage/getDelegationsLocalStorageKey";

import { useDelegationsV2 } from "../hooks/client/api/useDelegationsV2";
import { useDelegationStorage } from "../hooks/storage/useDelegationStorage";

interface DelegationV2State {
  isLoading: boolean;
  hasMoreDelegations: boolean;
  delegations: DelegationV2[];
  addDelegation: (delegation: DelegationLike) => void;
  updateDelegationStatus: (is: string, status: DelegationV2["state"]) => void;
  fetchMoreDelegations: () => void;
  findDelegationByTxHash: (txHash: string) => DelegationV2 | undefined;
}

const { StateProvider, useState } = createStateUtils<DelegationV2State>({
  isLoading: false,
  delegations: [],
  hasMoreDelegations: false,
  addDelegation: () => {},
  updateDelegationStatus: () => {},
  fetchMoreDelegations: () => {},
  findDelegationByTxHash: () => undefined,
});

export function DelegationV2State({ children }: PropsWithChildren) {
  const { publicKeyNoCoord } = useBTCWallet();
  const { data, fetchNextPage, isFetchingNextPage, hasNextPage } =
    useDelegationsV2();

  // States
  const { delegations, addPendingDelegation, updateDelegationStatus } =
    useDelegationStorage(
      getDelegationsV2LocalStorageKey(publicKeyNoCoord),
      data?.delegations,
    );

  // Get a delegation by its txHash
  const findDelegationByTxHash = useCallback(
    (txHash: string) => delegations.find((d) => d.stakingTxHashHex === txHash),
    [delegations],
  );

  // Context
  const state = useMemo(
    () => ({
      delegations: delegations,
      isLoading: isFetchingNextPage,
      hasMoreDelegations: hasNextPage,
      addDelegation: addPendingDelegation,
      updateDelegationStatus,
      findDelegationByTxHash,
      fetchMoreDelegations: fetchNextPage,
    }),
    [
      delegations,
      isFetchingNextPage,
      hasNextPage,
      addPendingDelegation,
      updateDelegationStatus,
      findDelegationByTxHash,
      fetchNextPage,
    ],
  );

  return <StateProvider value={state}>{children}</StateProvider>;
}

export const useDelegationV2State = useState;
