import { useCallback, useEffect, useMemo, useRef, useState } from "react";

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

interface OptimisticStaking {
  validatorAddress: string;
  amount: bigint;
  timestamp: number;
}

interface OptimisticStakingStorage {
  validatorAddress: string;
  amount: string;
  timestamp: number;
}

const OPTIMISTIC_UNBONDING_KEY = "baby-optimistic-unbondings";
const OPTIMISTIC_STAKING_KEY = "baby-optimistic-stakings";
const UNBONDING_PERIOD_MS = 21 * 24 * 60 * 60 * 1000;
const POLLING_INTERVAL_MS = 15000;
const OPTIMISTIC_TIMEOUT_MS = 3 * 60 * 1000;

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

  const [optimisticStakings, setOptimisticStakings] = useState<
    OptimisticStaking[]
  >(() => {
    try {
      const stored = localStorage.getItem(OPTIMISTIC_STAKING_KEY);
      if (stored) {
        const parsedStorage: OptimisticStakingStorage[] = JSON.parse(stored);
        const parsed: OptimisticStaking[] = parsedStorage.map((item) => ({
          ...item,
          amount: BigInt(item.amount),
        }));
        return parsed;
      }
      return [];
    } catch {
      return [];
    }
  });

  const isStakingRef = useRef(false);

  const { bech32Address } = useCosmosWallet();
  const {
    data: delegations = [],
    refetch: refetchDelegations,
    isLoading,
  } = useDelegations(bech32Address);
  const {
    data: unbondingDelegations = [],
    refetch: refetchUnbondingDelegations,
    isLoading: isUnbondingLoading,
  } = useUnbondingDelegations();
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
    const storageFormat: OptimisticStakingStorage[] = optimisticStakings.map(
      (item) => ({
        ...item,
        amount: item.amount.toString(),
      }),
    );

    if (optimisticStakings.length > 0 || !isStakingRef.current) {
      localStorage.setItem(
        OPTIMISTIC_STAKING_KEY,
        JSON.stringify(storageFormat),
      );
    }
  }, [optimisticStakings]);

  const optimisticUnbondingsRef = useRef(optimisticUnbondings);
  const optimisticStakingsRef = useRef(optimisticStakings);

  useEffect(() => {
    optimisticUnbondingsRef.current = optimisticUnbondings;
  }, [optimisticUnbondings]);

  useEffect(() => {
    optimisticStakingsRef.current = optimisticStakings;
  }, [optimisticStakings]);

  useEffect(() => {
    const POLLING_INTERVAL = POLLING_INTERVAL_MS;
    const OPTIMISTIC_TIMEOUT = OPTIMISTIC_TIMEOUT_MS;

    const poll = async () => {
      try {
        await refetchDelegations();
        await refetchUnbondingDelegations();

        // Clean up expired optimistic unbondings
        const currentUnbondings = optimisticUnbondingsRef.current;
        if (currentUnbondings.length > 0) {
          const validUnbondings = currentUnbondings.filter(
            (unbonding) =>
              Date.now() - unbonding.timestamp < OPTIMISTIC_TIMEOUT,
          );
          if (validUnbondings.length !== currentUnbondings.length) {
            setOptimisticUnbondings(validUnbondings);
          }
        }

        // Clean up expired optimistic stakings
        const currentStakings = optimisticStakingsRef.current;
        if (currentStakings.length > 0) {
          const validStakings = currentStakings.filter(
            (staking) => Date.now() - staking.timestamp < OPTIMISTIC_TIMEOUT,
          );
          if (validStakings.length !== currentStakings.length) {
            setOptimisticStakings(validStakings);
          }
        }
      } catch (error) {
        console.error("Polling error:", error);
      }
    };

    const interval = setInterval(poll, POLLING_INTERVAL);
    return () => clearInterval(interval);
  }, [refetchDelegations, refetchUnbondingDelegations]);

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
          // Use the first entry to represent the unbonding state for this validator
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

    const result = Object.values(
      delegations.reduce(
        (acc, item) => {
          const validatorAddress = item.delegation.validatorAddress;
          const delegation = acc[validatorAddress];

          const apiAmount = BigInt(item.balance.amount);

          const optimisticUnbonding = optimisticUnbondings.find(
            (opt) => opt.validatorAddress === validatorAddress,
          );
          let effectiveAmount = apiAmount;

          if (optimisticUnbonding) {
            effectiveAmount = optimisticUnbonding.expectedAmount;
          } else if (unbondingInfoByValidator[validatorAddress]) {
            const unbondingAmount =
              unbondingInfoByValidator[validatorAddress].amount;
            effectiveAmount =
              apiAmount > unbondingAmount
                ? apiAmount - unbondingAmount
                : apiAmount;
          }

          const isUnbonding = unbondingValidatorAddresses.has(validatorAddress);
          const status: DelegationStatus = isUnbonding ? "unbonding" : "active";

          if (delegation) {
            delegation.shares += parseFloat(item.delegation.shares);
            delegation.amount += effectiveAmount;
            if (status === "unbonding") {
              delegation.status = "unbonding";
              delegation.unbondingInfo =
                unbondingInfoByValidator[validatorAddress];
            }
          } else {
            acc[validatorAddress] = {
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
            };
          }
          return acc;
        },
        {} as Record<string, Delegation>,
      ),
    );

    const optimisticStakingsToRemove: OptimisticStaking[] = [];

    optimisticStakings.forEach((optimisticStaking) => {
      const { validatorAddress } = optimisticStaking;

      const age = Date.now() - optimisticStaking.timestamp;
      const isConfirmedInAPI = age > 30000;

      if (isConfirmedInAPI) {
        optimisticStakingsToRemove.push(optimisticStaking);
      } else {
        const validator = validatorMap[validatorAddress];
        if (validator) {
          const pendingDelegation = {
            validator,
            delegatorAddress: bech32Address || "",
            shares: 0,
            amount: optimisticStaking.amount,
            coin: "ubbn" as const,
            status: "pending" as DelegationStatus,
          };
          result.push(pendingDelegation);
        }
      }
    });

    if (optimisticStakingsToRemove.length > 0) {
      setOptimisticStakings((prev) =>
        prev.filter(
          (opt) =>
            !optimisticStakingsToRemove.some(
              (toRemove) =>
                toRemove.validatorAddress === opt.validatorAddress &&
                toRemove.timestamp === opt.timestamp,
            ),
        ),
      );
    }

    return result;
  }, [
    delegations,
    validatorMap,
    isValidatorLoading,
    unbondingDelegations,
    optimisticUnbondings,
    optimisticStakings,
    bech32Address,
  ]);

  const stake = useCallback(
    async ({ validatorAddress, amount }: StakingParams) => {
      isStakingRef.current = true;

      if (!bech32Address) {
        throw Error("Babylon Wallet is not connected");
      }

      const stakeAmount =
        typeof amount === "string"
          ? babylon.utils.babyToUbbn(Number(amount))
          : BigInt(amount);

      const optimisticStaking: OptimisticStaking = {
        validatorAddress,
        amount: stakeAmount,
        timestamp: Date.now(),
      };

      setOptimisticStakings((prev) => {
        const filtered = prev.filter(
          (opt) => opt.validatorAddress !== validatorAddress,
        );
        const newStakings = [...filtered, optimisticStaking];
        return newStakings;
      });

      try {
        const stakeMsg = babylon.txs.baby.createStakeMsg({
          validatorAddress,
          delegatorAddress: bech32Address,
          amount: stakeAmount,
        });

        const signedTx = await signBbnTx(stakeMsg);
        const result = await sendBbnTx(signedTx);

        setTimeout(() => {
          isStakingRef.current = false;
        }, 5000);

        return result;
      } catch (error) {
        isStakingRef.current = false;
        setOptimisticStakings((prev) =>
          prev.filter(
            (opt) =>
              !(
                opt.validatorAddress === validatorAddress &&
                opt.timestamp === optimisticStaking.timestamp
              ),
          ),
        );

        throw error;
      }
    },
    [bech32Address, signBbnTx, sendBbnTx],
  );

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

      try {
        const unstakeMsg = babylon.txs.baby.createUnstakeMsg({
          validatorAddress,
          delegatorAddress: bech32Address,
          amount: unbondAmount,
        });

        const signedTx = await signBbnTx(unstakeMsg);
        const result = await sendBbnTx(signedTx);

        setTimeout(() => {
          (async () => {
            try {
              await Promise.all([
                refetchDelegations(),
                refetchUnbondingDelegations(),
              ]);
            } catch {
              // Ignore refetch errors
            }
          })();
        }, 2000);

        return result;
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
    [
      bech32Address,
      delegations,
      signBbnTx,
      sendBbnTx,
      refetchDelegations,
      refetchUnbondingDelegations,
    ],
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
  };
}
