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

const OPTIMISTIC_UNBONDING_KEY = "baby-optimistic-unbondings";
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
    if (optimisticUnbondings.length === 0) return;

    const POLLING_INTERVAL = POLLING_INTERVAL_MS;
    const OPTIMISTIC_TIMEOUT = OPTIMISTIC_TIMEOUT_MS;

    const poll = async () => {
      const now = Date.now();
      const expiredOptimistic: OptimisticUnbonding[] = [];
      const validOptimistic: OptimisticUnbonding[] = [];

      optimisticUnbondings.forEach((opt) => {
        const ageMs = now - opt.timestamp;

        if (ageMs > OPTIMISTIC_TIMEOUT) {
          expiredOptimistic.push(opt);
        } else {
          validOptimistic.push(opt);
        }
      });

      if (expiredOptimistic.length > 0) {
        setOptimisticUnbondings(validOptimistic);
      }

      await Promise.all([refetchDelegations(), refetchUnbondingDelegations()]);
    };

    const interval = setInterval(poll, POLLING_INTERVAL);
    return () => clearInterval(interval);
  }, [optimisticUnbondings, refetchDelegations, refetchUnbondingDelegations]);

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

    return result;
  }, [
    delegations,
    validatorMap,
    isValidatorLoading,
    unbondingDelegations,
    optimisticUnbondings,
  ]);

  const stake = useCallback(
    async ({ validatorAddress, amount }: StakingParams) => {
      if (!bech32Address) throw Error("Babylon Wallet is not connected");

      const stakeMsg = babylon.txs.baby.createStakeMsg({
        validatorAddress,
        delegatorAddress: bech32Address,
        amount:
          typeof amount === "string"
            ? babylon.utils.babyToUbbn(Number(amount))
            : BigInt(amount),
      });
      const signedTx = await signBbnTx(stakeMsg);
      const result = await sendBbnTx(signedTx);

      await Promise.all([refetchDelegations(), refetchUnbondingDelegations()]);
      return result;
    },
    [
      bech32Address,
      signBbnTx,
      sendBbnTx,
      refetchDelegations,
      refetchUnbondingDelegations,
    ],
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
            } catch (err) {
              console.error("Error during refetch after unstake:", err);
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
