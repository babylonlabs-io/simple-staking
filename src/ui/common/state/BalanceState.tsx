import { useMemo, type PropsWithChildren } from "react";

import { useBbnQuery } from "@/ui/common/hooks/client/rpc/queries/useBbnQuery";
import { createStateUtils } from "@/ui/common/utils/createStateUtils";

import { useAppState } from ".";
import { DelegationV2StakingState } from "../types/delegationsV2";

import { useDelegationV2State } from "./DelegationV2State";

interface BalanceStateProps {
  loading: boolean;
  stakableBtcBalance: number;
  totalBtcBalance: number;
  stakedBtcBalance: number;
  bbnBalance: number;
  inscriptionsBtcBalance: number;
  hasRpcError: boolean;
  reconnectRpc: () => void;
}

const STAKED_BALANCE_STATUSES = [
  DelegationV2StakingState.ACTIVE,
  DelegationV2StakingState.TIMELOCK_UNBONDING,
  DelegationV2StakingState.EARLY_UNBONDING,
  DelegationV2StakingState.TIMELOCK_WITHDRAWABLE,
  DelegationV2StakingState.EARLY_UNBONDING_WITHDRAWABLE,
  DelegationV2StakingState.TIMELOCK_SLASHING_WITHDRAWABLE,
  DelegationV2StakingState.EARLY_UNBONDING_SLASHING_WITHDRAWABLE,
  DelegationV2StakingState.INTERMEDIATE_UNBONDING_SUBMITTED,
];

const defaultState: BalanceStateProps = {
  loading: false,
  stakableBtcBalance: 0,
  totalBtcBalance: 0,
  stakedBtcBalance: 0,
  bbnBalance: 0,
  inscriptionsBtcBalance: 0,
  hasRpcError: false,
  reconnectRpc: () => {},
};

const { StateProvider, useState: useBalanceState } =
  createStateUtils<BalanceStateProps>(defaultState);

export function BalanceState({ children }: PropsWithChildren) {
  const {
    availableUTXOs,
    allUTXOs,
    inscriptionsUTXOs,
    isLoading: isBTCBalanceLoading,
  } = useAppState();

  const {
    balanceQuery: { data: bbnBalance = 0, isLoading: isCosmosBalanceLoading },
    hasRpcError,
    reconnectRpc,
  } = useBbnQuery();

  const { delegations } = useDelegationV2State();

  const loading = isBTCBalanceLoading || isCosmosBalanceLoading;

  // Stakable BTC Balance which is the sum of all UTXOs that are not Ordinals
  const stakableBtcBalance = useMemo(
    () =>
      availableUTXOs?.reduce(
        (accumulator, item) => accumulator + item.value,
        0,
      ) ?? 0,
    [availableUTXOs],
  );

  // Total BTC Balance which is the sum of all UTXOs
  const totalBtcBalance = useMemo(() => {
    return (
      allUTXOs?.reduce((accumulator, item) => accumulator + item.value, 0) ?? 0
    );
  }, [allUTXOs]);

  const inscriptionsBtcBalance = useMemo(() => {
    return (
      inscriptionsUTXOs?.reduce(
        (accumulator, item) => accumulator + item.value,
        0,
      ) ?? 0
    );
  }, [inscriptionsUTXOs]);

  // The amount of balance that is staked in the babylon system.
  // Temporary solution to calculate total staked balance while waiting for API support.
  // Once the API is complete, it will directly provide the staker's total balance
  // (active + unbonding + withdrawing). For now, we manually sum up all delegation
  // amounts that are in relevant states, including intermediate states.
  const stakedBtcBalance = useMemo(() => {
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

  const context = useMemo(
    () => ({
      loading,
      stakableBtcBalance,
      totalBtcBalance,
      bbnBalance,
      stakedBtcBalance,
      inscriptionsBtcBalance,
      hasRpcError,
      reconnectRpc,
    }),
    [
      loading,
      stakableBtcBalance,
      totalBtcBalance,
      bbnBalance,
      stakedBtcBalance,
      inscriptionsBtcBalance,
      hasRpcError,
      reconnectRpc,
    ],
  );

  return <StateProvider value={context}>{children}</StateProvider>;
}

export { useBalanceState };
