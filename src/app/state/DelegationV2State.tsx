import { useCallback, useMemo, type PropsWithChildren } from "react";
import { useLocalStorage } from "usehooks-ts";

import { useBTCWallet } from "@/app/context/wallet/BTCWalletProvider";
import {
  type DelegationLike,
  type DelegationV2,
} from "@/app/types/delegationsV2";
import { createStateUtils } from "@/utils/createStateUtils";
import { getDelegationsV2LocalStorageKey } from "@/utils/local_storage/getDelegationsLocalStorageKey";

import { useCosmosWallet } from "../context/wallet/CosmosWalletProvider";
import { useDelegationsV2 } from "../hooks/client/api/useDelegationsV2";
import { useDelegationStorage } from "../hooks/storage/useDelegationStorage";

interface DelegationV2State {
  isLoading: boolean;
  isFetchingNextPage: boolean;
  linkedDelegationsVisibility: boolean;
  hasMoreDelegations: boolean;
  delegations: DelegationV2[];
  addDelegation: (delegation: DelegationLike) => void;
  updateDelegationStatus: (is: string, status: DelegationV2["state"]) => void;
  fetchMoreDelegations: () => void;
  findDelegationByTxHash: (txHash: string) => DelegationV2 | undefined;
  refetch: () => void;
  displayLinkedDelegations: (value: boolean) => void;
}

const { StateProvider, useState: useDelegationV2State } =
  createStateUtils<DelegationV2State>({
    linkedDelegationsVisibility: false,
    isLoading: false,
    isFetchingNextPage: false,
    delegations: [],
    hasMoreDelegations: false,
    addDelegation: () => {},
    updateDelegationStatus: () => {},
    fetchMoreDelegations: () => {},
    findDelegationByTxHash: () => undefined,
    refetch: () => Promise.resolve(),
    displayLinkedDelegations: () => {},
  });

export function DelegationV2State({ children }: PropsWithChildren) {
  const [showLinkedDelegations, setLinkedDelegations] = useLocalStorage(
    "baby-linked-wallet-stakes-visibility",
    false,
  );
  const { publicKeyNoCoord } = useBTCWallet();
  const { bech32Address } = useCosmosWallet();

  const {
    data,
    fetchNextPage,
    isFetchingNextPage,
    isLoading,
    hasNextPage,
    refetch,
  } = useDelegationsV2(!showLinkedDelegations ? bech32Address : undefined);
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
      delegations,
      isLoading,
      isFetchingNextPage,
      hasMoreDelegations: hasNextPage,
      linkedDelegationsVisibility: showLinkedDelegations,
      displayLinkedDelegations: setLinkedDelegations,
      addDelegation: addPendingDelegation,
      updateDelegationStatus,
      findDelegationByTxHash,
      fetchMoreDelegations: fetchNextPage,
      refetch: async () => {
        await refetch();
      },
    }),
    [
      delegations,
      isFetchingNextPage,
      isLoading,
      hasNextPage,
      showLinkedDelegations,
      addPendingDelegation,
      updateDelegationStatus,
      findDelegationByTxHash,
      fetchNextPage,
      setLinkedDelegations,
      refetch,
    ],
  );

  return <StateProvider value={state}>{children}</StateProvider>;
}

export { useDelegationV2State };
