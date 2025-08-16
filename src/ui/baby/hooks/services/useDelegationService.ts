import { useCallback, useEffect, useMemo, useState } from "react";

import babylon from "@/infrastructure/babylon";
import { useDelegations } from "@/ui/baby/hooks/api/useDelegations";
import { useUnbondingDelegations } from "@/ui/baby/hooks/api/useUnbondingDelegations";
import {
  type Validator,
  useValidatorService,
} from "@/ui/baby/hooks/services/useValidatorService";
import { useCosmosWallet } from "@/ui/common/context/wallet/CosmosWalletProvider";
import { useBbnTransaction } from "@/ui/common/hooks/client/rpc/mutation/useBbnTransaction";
import { type DelegationStatus } from "@/ui/common/types/delegations";

// Small helper to stringify objects containing BigInt
const safeStringify = (obj: any) =>
  JSON.stringify(obj, (_, v) => (typeof v === "bigint" ? v.toString() : v));

// Track validators involved in optimistic operations during this browser session
export const sessionOptimisticValidators = new Set<string>();
const sessionValidatorTimes = new Map<string, number>();

// Temporary debug cutoff exportable
export const DEBUG_CUTOFF_MS = new Date("2025-08-14T21:20:00Z").getTime();

interface StakingParams {
  validatorAddress: string;
  amount: string | number;
}

export interface UnbondingInfo {
  amount: bigint;
  completionTime: string;
  statusSuffix?: string;
  isOptimistic?: boolean;
}

export interface Delegation {
  validator: Validator;
  delegatorAddress: string;
  shares: number;
  amount: bigint;
  coin: "ubbn";
  status?: DelegationStatus;
  unbondingInfo?: UnbondingInfo;
  // present for optimistic (pending/unbonding) delegations to aid debugging
  timestamp?: number;
}

interface OptimisticUnbonding {
  validatorAddress: string;
  expectedAmount: bigint;
  unbondingAmount: bigint;
  timestamp: number;
}

interface OptimisticUnbondingStorage {
  validatorAddress: string;
  expectedAmount: string;
  unbondingAmount: string;
  timestamp: number;
}

interface OptimisticStake {
  validatorAddress: string;
  expectedAmount: bigint;
  stakingAmount: bigint;
  timestamp: number;
}

interface OptimisticStakeStorage {
  validatorAddress: string;
  expectedAmount: string;
  stakingAmount: string;
  timestamp: number;
}

const OPTIMISTIC_UNBONDING_KEY = "baby-optimistic-unbondings";
const OPTIMISTIC_STAKE_KEY = "baby-optimistic-stakes";
const UNBONDING_PERIOD_MS = 21 * 24 * 60 * 60 * 1000;

function getStatusSuffix(age: number, ageMinutes: number): string {
  if (age > 2 * 60 * 1000) {
    return ` (${ageMinutes}min - verifying...)`;
  } else if (age > 30 * 1000) {
    return " (confirming...)";
  }
  return "";
}

export function useDelegationService() {
  const [optimisticUnbondings, setOptimisticUnbondings] = useState<
    OptimisticUnbonding[]
  >(() => {
    try {
      const stored = localStorage.getItem(OPTIMISTIC_UNBONDING_KEY);
      if (stored) {
        const parsedStorage: OptimisticUnbondingStorage[] = JSON.parse(stored);
        const parsed: OptimisticUnbonding[] = parsedStorage.map((item) => ({
          ...item,
          expectedAmount: BigInt(item.expectedAmount),
          unbondingAmount: BigInt(item.unbondingAmount),
        }));

        return parsed;
      }
      return [];
    } catch {
      return [];
    }
  });

  const [optimisticStakes, setOptimisticStakes] = useState<OptimisticStake[]>(
    () => {
      try {
        const stored = localStorage.getItem(OPTIMISTIC_STAKE_KEY);
        if (stored) {
          const parsedStorage: OptimisticStakeStorage[] = JSON.parse(stored);
          return parsedStorage.map((item) => ({
            ...item,
            expectedAmount: BigInt(item.expectedAmount),
            stakingAmount: BigInt(item.stakingAmount),
          }));
        }
        return [];
      } catch {
        return [];
      }
    },
  );

  const { bech32Address } = useCosmosWallet();
  const { data: delegations = [], isLoading } = useDelegations(bech32Address);
  const { data: unbondingDelegations = [], isLoading: isUnbondingLoading } =
    useUnbondingDelegations();
  const { signBbnTx, sendBbnTx, estimateBbnGasFee } = useBbnTransaction();
  const { validatorMap, loading: isValidatorLoading } = useValidatorService();

  useEffect(() => {
    const storageFormat: OptimisticUnbondingStorage[] =
      optimisticUnbondings.map((item) => ({
        ...item,
        expectedAmount: item.expectedAmount.toString(),
        unbondingAmount: item.unbondingAmount.toString(),
      }));

    localStorage.setItem(
      OPTIMISTIC_UNBONDING_KEY,
      JSON.stringify(storageFormat),
    );
  }, [optimisticUnbondings]);

  useEffect(() => {
    const storageFormat: OptimisticStakeStorage[] = optimisticStakes.map(
      (item) => ({
        ...item,
        expectedAmount: item.expectedAmount.toString(),
        stakingAmount: item.stakingAmount.toString(),
      }),
    );

    localStorage.setItem(OPTIMISTIC_STAKE_KEY, JSON.stringify(storageFormat));
  }, [optimisticStakes]);

  const groupedDelegations = useMemo(() => {
    if (isValidatorLoading) {
      return [];
    }

    const unbondingValidatorAddresses = new Set<string>();
    const unbondingInfoByValidator: Record<string, UnbondingInfo> = {};

    unbondingDelegations.forEach((unbonding: any) => {
      const validatorAddress =
        unbonding.validatorAddress || unbonding.validator_address;
      const entries = unbonding.entries || [];

      if (validatorAddress) {
        unbondingValidatorAddresses.add(validatorAddress);

        if (entries.length > 0) {
          // Use the first entry to represent the unbonding state for this validator.
          // In Cosmos SDK, multiple unbonding entries can exist per validator if the user
          // unbonds at different times. For UI purposes, we show one representative entry.
          // entries[0] is typically the earliest or most recent unbonding delegation.
          const firstEntry = entries[0];
          unbondingInfoByValidator[validatorAddress] = {
            amount: BigInt(
              firstEntry.balance || firstEntry.initial_balance || 0,
            ),
            completionTime:
              firstEntry.completion_time || new Date().toISOString(),
            isOptimistic: false,
          };
        }
      }
    });

    const optimisticUnbondingsToRemove: OptimisticUnbonding[] = [];

    optimisticUnbondings.forEach((optimistic) => {
      const { validatorAddress } = optimistic;

      const isConfirmedInAPI =
        unbondingValidatorAddresses.has(validatorAddress);

      if (isConfirmedInAPI) {
        optimisticUnbondingsToRemove.push(optimistic);
      } else {
        unbondingValidatorAddresses.add(validatorAddress);
        const age = Date.now() - optimistic.timestamp;
        const ageMinutes = Math.floor(age / (60 * 1000));
        const estimatedCompletionTime = new Date(
          optimistic.timestamp + UNBONDING_PERIOD_MS,
        );

        const statusSuffix = getStatusSuffix(age, ageMinutes);

        unbondingInfoByValidator[validatorAddress] = {
          amount: optimistic.unbondingAmount,
          completionTime: estimatedCompletionTime.toISOString(),
          statusSuffix,
          isOptimistic: true,
        };
      }
    });

    if (optimisticUnbondingsToRemove.length > 0) {
      setOptimisticUnbondings((prev) =>
        prev.filter(
          (opt) =>
            !optimisticUnbondingsToRemove.some(
              (toRemove) =>
                toRemove.validatorAddress === opt.validatorAddress &&
                toRemove.timestamp === opt.timestamp,
            ),
        ),
      );
    }

    const optimisticStakesToRemove: OptimisticStake[] = [];

    optimisticStakes.forEach((optimistic) => {
      const apiDelegation = delegations.find(
        (d) => d.delegation.validatorAddress === optimistic.validatorAddress,
      );

      if (apiDelegation) {
        const apiAmount = BigInt(apiDelegation.balance.amount);
        if (apiAmount >= optimistic.expectedAmount) {
          optimisticStakesToRemove.push(optimistic);
        }
      }
    });

    if (optimisticStakesToRemove.length > 0) {
      setOptimisticStakes((prev) =>
        prev.filter(
          (opt) =>
            !optimisticStakesToRemove.some(
              (toRemove) =>
                toRemove.validatorAddress === opt.validatorAddress &&
                toRemove.timestamp === opt.timestamp,
            ),
        ),
      );
    }

    const tempAcc: Record<string, Delegation> = {};

    delegations.forEach((item) => {
      const validatorAddress = item.delegation.validatorAddress;
      const apiAmount = BigInt(item.balance.amount);

      const optimisticUnbonding = optimisticUnbondings.find(
        (opt) => opt.validatorAddress === validatorAddress,
      );

      const optimisticStake = optimisticStakes.find(
        (opt) => opt.validatorAddress === validatorAddress,
      );

      let effectiveAmount = apiAmount;

      if (optimisticStake) {
        effectiveAmount = optimisticStake.expectedAmount;
      } else if (optimisticUnbonding) {
        effectiveAmount = optimisticUnbonding.expectedAmount;
      } else if (unbondingInfoByValidator[validatorAddress]) {
        const unbondingAmount =
          unbondingInfoByValidator[validatorAddress].amount;
        effectiveAmount =
          apiAmount > unbondingAmount ? apiAmount - unbondingAmount : apiAmount;
      }

      const isUnbonding = unbondingValidatorAddresses.has(validatorAddress);

      let status: DelegationStatus;
      if (optimisticStake) {
        status = "pending";
      } else if (isUnbonding) {
        status = "unbonding";
      } else {
        status = "active";
      }

      const existing = tempAcc[validatorAddress];

      if (existing) {
        const updated: Delegation = {
          ...existing,
          shares: existing.shares + parseFloat(item.delegation.shares),
          amount: existing.amount + effectiveAmount,
          status,
          unbondingInfo:
            status === "unbonding"
              ? unbondingInfoByValidator[validatorAddress]
              : undefined,
          timestamp:
            optimisticStake?.timestamp ?? existing.timestamp ?? Date.now(),
        };

        tempAcc[validatorAddress] = updated;
      } else {
        tempAcc[validatorAddress] = {
          validator: validatorMap[validatorAddress],
          delegatorAddress: item.delegation.delegatorAddress,
          shares: parseFloat(item.delegation.shares),
          amount: effectiveAmount,
          coin: "ubbn",
          status,
          unbondingInfo:
            status === "unbonding"
              ? unbondingInfoByValidator[validatorAddress]
              : undefined,
          timestamp:
            optimisticStake?.timestamp ?? optimisticUnbonding?.timestamp,
        };
      }
    });

    // Add optimistic stakes for validators not yet present in API delegations
    optimisticStakes.forEach((optimistic) => {
      const validatorAddress = optimistic.validatorAddress;
      if (!tempAcc[validatorAddress]) {
        const validator = validatorMap[validatorAddress];
        if (validator) {
          tempAcc[validatorAddress] = {
            validator,
            delegatorAddress: bech32Address || "",
            shares: 0,
            amount: optimistic.expectedAmount,
            coin: "ubbn",
            status: "pending",
            timestamp: optimistic.timestamp,
          };
        }
      }
    });

    const result = Object.values(tempAcc);

    // Only log delegations related to current test session (optimistic validators)
    const sessionDelegations = result.filter((d) => {
      const vAddr = d.validator.address;
      if (!sessionOptimisticValidators.has(vAddr)) return false;
      const ts = sessionValidatorTimes.get(vAddr) || 0;
      return ts >= DEBUG_CUTOFF_MS;
    });

    if (sessionDelegations.length > 0) {
      console.log(
        "[BABY] Grouped delegations:",
        safeStringify(sessionDelegations),
      );
    }

    return result;
  }, [
    delegations,
    validatorMap,
    isValidatorLoading,
    unbondingDelegations,
    optimisticUnbondings,
    optimisticStakes,
    bech32Address,
  ]);

  /**
   * stake is used to sign the stake message and return the signed transaction
   * it does not send the transaction to the network
   */
  const stake = useCallback(
    async ({ validatorAddress, amount }: StakingParams) => {
      if (!bech32Address) throw Error("Babylon Wallet is not connected");

      const stakeAmount =
        typeof amount === "string"
          ? babylon.utils.babyToUbbn(Number(amount))
          : BigInt(amount);

      const currentDelegation = delegations.find(
        (d) => d.delegation.validatorAddress === validatorAddress,
      );
      const currentAmount = currentDelegation
        ? BigInt(currentDelegation.balance.amount)
        : 0n;

      const expectedAmountAfterStake = currentAmount + stakeAmount;

      const optimisticStake: OptimisticStake = {
        validatorAddress,
        expectedAmount: expectedAmountAfterStake,
        stakingAmount: stakeAmount,
        timestamp: Date.now(),
      };

      setOptimisticStakes((prev) => [
        ...prev.filter((opt) => opt.validatorAddress !== validatorAddress),
        optimisticStake,
      ]);

      // Mark this validator as part of current session operations
      sessionOptimisticValidators.add(validatorAddress);
      sessionValidatorTimes.set(validatorAddress, optimisticStake.timestamp);

      console.log(
        "[BABY] Added optimistic stake:",
        safeStringify(optimisticStake),
      );

      try {
        const stakeMsg = babylon.txs.baby.createStakeMsg({
          validatorAddress,
          delegatorAddress: bech32Address,
          amount: stakeAmount,
        });

        const signedTx = await signBbnTx(stakeMsg);

        return { signedTx, optimisticStake };
      } catch (error) {
        setOptimisticStakes((prev) =>
          prev.filter(
            (opt) =>
              !(
                opt.validatorAddress === validatorAddress &&
                opt.timestamp === optimisticStake.timestamp
              ),
          ),
        );
        throw error;
      }
    },
    [bech32Address, delegations, signBbnTx],
  );

  /**
   * unstake is used to sign the unstake message and return the signed transaction
   * it does not send the transaction to the network
   */
  const unstake = useCallback(
    async ({ validatorAddress, amount: amountInUbbn }: StakingParams) => {
      if (!bech32Address) throw Error("Babylon Wallet is not connected");

      const unbondAmount = BigInt(amountInUbbn);

      const currentDelegation = delegations.find(
        (d) => d.delegation.validatorAddress === validatorAddress,
      );
      const currentAmount = currentDelegation
        ? BigInt(currentDelegation.balance.amount)
        : 0n;
      const expectedAmountAfterUnbond = currentAmount - unbondAmount;

      const optimisticUnbonding: OptimisticUnbonding = {
        validatorAddress,
        expectedAmount: expectedAmountAfterUnbond,
        unbondingAmount: unbondAmount,
        timestamp: Date.now(),
      };

      setOptimisticUnbondings((prev) => [
        ...prev.filter((opt) => opt.validatorAddress !== validatorAddress),
        optimisticUnbonding,
      ]);

      sessionOptimisticValidators.add(validatorAddress);
      sessionValidatorTimes.set(
        validatorAddress,
        optimisticUnbonding.timestamp,
      );

      try {
        const unstakeMsg = babylon.txs.baby.createUnstakeMsg({
          validatorAddress,
          delegatorAddress: bech32Address,
          amount: unbondAmount,
        });

        const signedTx = await signBbnTx(unstakeMsg);

        return { signedTx, optimisticUnbonding };
      } catch (error) {
        setOptimisticUnbondings((prev) =>
          prev.filter(
            (opt) =>
              !(
                opt.validatorAddress === validatorAddress &&
                opt.timestamp === optimisticUnbonding.timestamp
              ),
          ),
        );

        throw error;
      }
    },
    [bech32Address, delegations, signBbnTx],
  );

  /**
   * sendTx is used to send the signed transaction to the network
   */
  const sendTx = useCallback(
    async (
      signedTx: Uint8Array,
      optimistic?: OptimisticUnbonding | OptimisticStake,
    ) => {
      try {
        const result = await sendBbnTx(signedTx);
        return result;
      } catch (error) {
        if (optimistic) {
          if (
            (optimistic as OptimisticUnbonding).unbondingAmount !== undefined
          ) {
            setOptimisticUnbondings((prev) =>
              prev.filter(
                (opt) =>
                  !(
                    opt.validatorAddress === optimistic.validatorAddress &&
                    opt.timestamp === optimistic.timestamp
                  ),
              ),
            );
          } else if (
            (optimistic as OptimisticStake).stakingAmount !== undefined
          ) {
            setOptimisticStakes((prev) =>
              prev.filter(
                (opt) =>
                  !(
                    opt.validatorAddress === optimistic.validatorAddress &&
                    opt.timestamp === optimistic.timestamp
                  ),
              ),
            );
          }
        }
        throw error;
      }
    },
    [sendBbnTx],
  );

  const estimateStakingFee = useCallback(
    async ({ validatorAddress, amount }: StakingParams) => {
      if (!bech32Address) throw Error("Babylon Wallet is not connected");

      const stakeMsg = babylon.txs.baby.createStakeMsg({
        validatorAddress,
        delegatorAddress: bech32Address,
        amount: babylon.utils.babyToUbbn(Number(amount)),
      });
      const result = await estimateBbnGasFee(stakeMsg);

      return result.amount.reduce((sum, { amount }) => sum + Number(amount), 0);
    },
    [bech32Address, estimateBbnGasFee],
  );

  return {
    loading: isLoading || isUnbondingLoading,
    delegations: groupedDelegations,
    stake,
    unstake,
    estimateStakingFee,
    sendTx,
  };
}
