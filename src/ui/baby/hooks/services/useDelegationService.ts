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

export function useDelegationService() {
  const [optimisticUnbondings, setOptimisticUnbondings] = useState<
    OptimisticUnbonding[]
  >(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem(OPTIMISTIC_UNBONDING_KEY);
        if (stored) {
          const parsedStorage: OptimisticUnbondingStorage[] =
            JSON.parse(stored);
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
    }
    return [];
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
    if (typeof window !== "undefined") {
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
    }
  }, [optimisticUnbondings]);

  useEffect(() => {
    if (optimisticUnbondings.length === 0) return;

    const POLLING_INTERVAL = 15000;
    const OPTIMISTIC_TIMEOUT = 3 * 60 * 1000;

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
          optimistic.timestamp + 21 * 24 * 60 * 60 * 1000,
        );

        let statusSuffix = "";
        if (age > 2 * 60 * 1000) {
          statusSuffix = ` (${ageMinutes}min - verifying...)`;
        } else if (age > 30 * 1000) {
          statusSuffix = " (confirming...)";
        }

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
    async ({ validatorAddress, amount }: StakingParams) => {
      if (!bech32Address) throw Error("Babylon Wallet is not connected");

      const unbondAmount = babylon.utils.babyToUbbn(Number(amount));

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
          Promise.all([refetchDelegations(), refetchUnbondingDelegations()]);
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
