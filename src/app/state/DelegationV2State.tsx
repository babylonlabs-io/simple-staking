import { useCallback, useMemo, type PropsWithChildren } from "react";

import { useBTCWallet } from "@/app/context/wallet/BTCWalletProvider";
import {
  DelegationV2StakingState,
  type DelegationLike,
  type DelegationV2,
} from "@/app/types/delegationsV2";
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
  getStakedBalance: () => number;
  refetch: () => void;
}

const STAKED_BALANCE_STATUSES = [
  DelegationV2StakingState.ACTIVE,
  DelegationV2StakingState.TIMELOCK_UNBONDING,
  DelegationV2StakingState.EARLY_UNBONDING,
  DelegationV2StakingState.TIMELOCK_WITHDRAWABLE,
  DelegationV2StakingState.EARLY_UNBONDING_WITHDRAWABLE,
  DelegationV2StakingState.TIMELOCK_SLASHING_WITHDRAWABLE,
  DelegationV2StakingState.EARLY_UNBONDING_SLASHING_WITHDRAWABLE,
  DelegationV2StakingState.SLASHED,
  DelegationV2StakingState.INTERMEDIATE_PENDING_BTC_CONFIRMATION,
  DelegationV2StakingState.INTERMEDIATE_UNBONDING_SUBMITTED,
];

const { StateProvider, useState } = createStateUtils<DelegationV2State>({
  isLoading: false,
  delegations: [],
  hasMoreDelegations: false,
  addDelegation: () => {},
  updateDelegationStatus: () => {},
  fetchMoreDelegations: () => {},
  findDelegationByTxHash: () => undefined,
  getStakedBalance: () => 0,
  refetch: () => Promise.resolve(),
});

export function DelegationV2State({ children }: PropsWithChildren) {
  const { publicKeyNoCoord } = useBTCWallet();
  const { data, fetchNextPage, isFetchingNextPage, hasNextPage, refetch } =
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
  // Temporary solution to calculate total staked balance while waiting for API support.
  // Once the API is complete, it will directly provide the staker's total balance
  // (active + unbonding + withdrawing). For now, we manually sum up all delegation
  // amounts that are in relevant states, including intermediate states.
  const getStakedBalance = useCallback(() => {
    // First create a map of status -> amounts array
    const statusAmountMap = delegations.reduce(
      (acc, delegation) => {
        if (!STAKED_BALANCE_STATUSES.includes(delegation.state)) {
          return acc;
        }
        if (!acc[delegation.state]) {
          acc[delegation.state] = [];
        }
        acc[delegation.state].push(delegation.stakingAmount);
        return acc;
      },
      {} as Record<DelegationV2StakingState, number[]>,
    );

    // Then sum up all amounts across all statuses into a single number
    return Object.values(statusAmountMap)
      .flat()
      .reduce((total, amount) => total + amount, 0);
  }, [delegations]);

  // Context
  const state = useMemo(
    () => ({
      delegations,
      isLoading: isFetchingNextPage,
      hasMoreDelegations: hasNextPage,
      addDelegation: addPendingDelegation,
      updateDelegationStatus,
      findDelegationByTxHash,
      fetchMoreDelegations: fetchNextPage,
      getStakedBalance,
      refetch: async () => {
        await refetch();
      },
    }),
    [
      delegations,
      isFetchingNextPage,
      hasNextPage,
      addPendingDelegation,
      updateDelegationStatus,
      findDelegationByTxHash,
      fetchNextPage,
      getStakedBalance,
      refetch,
    ],
  );

  return <StateProvider value={state}>{children}</StateProvider>;
}

export const useDelegationV2State = useState;
