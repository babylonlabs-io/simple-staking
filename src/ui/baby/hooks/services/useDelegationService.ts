import { useCallback, useMemo, useState } from "react";

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

interface PendingStake {
  validatorAddress: string;
  amount: bigint;
  timestamp: number;
}

interface ExpectedDelegationAmount {
  validatorAddress: string;
  expectedAmount: bigint;
  lastUpdated: number;
}

const PENDING_STAKE_API_UPDATE_TIMEOUT_MS = 5000;

export function useDelegationService() {
  const [pendingStakes, setPendingStakes] = useState<PendingStake[]>([]);
  const [expectedAmounts, setExpectedAmounts] = useState<
    ExpectedDelegationAmount[]
  >([]);

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

  const groupedDelegations = useMemo(() => {
    if (isValidatorLoading) {
      return [];
    }

    const unbondingValidatorAddresses = new Set<string>();
    const unbondingInfoByValidator: Record<string, UnbondingInfo> = {};

    unbondingDelegations.forEach((unbonding: any) => {
      const validatorAddress =
        unbonding.validatorAddress ||
        unbonding.validator_address ||
        unbonding.validatorAddr;

      if (validatorAddress) {
        unbondingValidatorAddresses.add(validatorAddress);

        const entries = unbonding.entries || [];
        if (entries.length > 0) {
          const firstEntry = entries[0];
          unbondingInfoByValidator[validatorAddress] = {
            amount: BigInt(
              firstEntry.balance || firstEntry.initial_balance || 0,
            ),
            completionTime:
              firstEntry.completion_time || new Date().toISOString(),
          };
        }
      }
    });

    const expectedAmountsByValidator = expectedAmounts.reduce(
      (acc, expected) => {
        acc[expected.validatorAddress] = expected.expectedAmount;
        return acc;
      },
      {} as Record<string, bigint>,
    );

    const result = Object.values(
      delegations.reduce(
        (acc, item) => {
          const validatorAddress = item.delegation.validatorAddress;
          const delegation = acc[validatorAddress];

          const apiAmount = BigInt(item.balance.amount);
          const expectedAmount = expectedAmountsByValidator[validatorAddress];

          const effectiveAmount =
            expectedAmount !== undefined
              ? apiAmount <= expectedAmount
                ? apiAmount
                : expectedAmount
              : apiAmount;

          const hasApiUnbonding =
            unbondingValidatorAddresses.has(validatorAddress);
          const hasExpectedReduction =
            expectedAmount !== undefined && expectedAmount < apiAmount;

          let status: DelegationStatus;
          if (hasApiUnbonding || hasExpectedReduction) {
            status = "unbonding";
          } else {
            status = "active";
          }

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

    const pendingStakesToRemove: PendingStake[] = [];

    pendingStakes.forEach((pendingStake) => {
      const validator = validatorMap[pendingStake.validatorAddress];

      if (validator) {
        const existingDelegation = result.find(
          (d) => d.validator.address === pendingStake.validatorAddress,
        );

        if (existingDelegation) {
          const hasTimePassedForApiUpdate =
            Date.now() - pendingStake.timestamp >
            PENDING_STAKE_API_UPDATE_TIMEOUT_MS;

          if (hasTimePassedForApiUpdate) {
            pendingStakesToRemove.push(pendingStake);
          } else {
            existingDelegation.amount += pendingStake.amount;
            existingDelegation.status = "pending";
          }
        } else {
          result.push({
            validator,
            delegatorAddress: bech32Address || "",
            shares: 0,
            amount: pendingStake.amount,
            coin: "ubbn",
            status: "pending",
          });
        }
      }
    });

    if (pendingStakesToRemove.length > 0) {
      const toRemoveSet = new Set(
        pendingStakesToRemove.map(
          (toRemove) => `${toRemove.validatorAddress}:${toRemove.timestamp}`,
        ),
      );
      setPendingStakes((prev) =>
        prev.filter(
          (p) => !toRemoveSet.has(`${p.validatorAddress}:${p.timestamp}`),
        ),
      );
    }

    const expectedAmountsToRemove: ExpectedDelegationAmount[] = [];
    expectedAmounts.forEach((expected) => {
      const currentDelegation = delegations.find(
        (d) => d.delegation.validatorAddress === expected.validatorAddress,
      );
      const currentApiAmount = currentDelegation
        ? BigInt(currentDelegation.balance.amount)
        : 0n;

      const apiMatchesExpectation = currentApiAmount <= expected.expectedAmount;
      const isStillUnbonding = unbondingValidatorAddresses.has(
        expected.validatorAddress,
      );

      if (apiMatchesExpectation && !isStillUnbonding) {
        expectedAmountsToRemove.push(expected);
      }
    });

    if (expectedAmountsToRemove.length > 0) {
      const toRemoveSet = new Set(
        expectedAmountsToRemove.map(
          (toRemove) => `${toRemove.validatorAddress}:${toRemove.lastUpdated}`,
        ),
      );
      setExpectedAmounts((prev) =>
        prev.filter(
          (e) => !toRemoveSet.has(`${e.validatorAddress}:${e.lastUpdated}`),
        ),
      );
    }

    return result;
  }, [
    delegations,
    validatorMap,
    isValidatorLoading,
    unbondingDelegations,
    pendingStakes,
    expectedAmounts,
    bech32Address,
  ]);

  const stake = useCallback(
    async ({ validatorAddress, amount }: StakingParams) => {
      if (!bech32Address) throw Error("Babylon Wallet is not connected");

      const stakeAmount =
        typeof amount === "string"
          ? babylon.utils.babyToUbbn(Number(amount))
          : BigInt(amount);

      const pendingStake: PendingStake = {
        validatorAddress,
        amount: stakeAmount,
        timestamp: Date.now(),
      };

      setPendingStakes((prev) => [...prev, pendingStake]);

      try {
        const stakeMsg = babylon.txs.baby.createStakeMsg({
          validatorAddress,
          delegatorAddress: bech32Address,
          amount: stakeAmount,
        });

        const signedTx = await signBbnTx(stakeMsg);
        const result = await sendBbnTx(signedTx);

        await Promise.all([
          refetchDelegations(),
          refetchUnbondingDelegations(),
        ]);

        return result;
      } catch (error) {
        // Remove from pending stakes on error
        setPendingStakes((prev) =>
          prev.filter(
            (p) =>
              !(
                p.validatorAddress === validatorAddress &&
                p.timestamp === pendingStake.timestamp
              ),
          ),
        );
        throw error;
      }
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

      const expectedAmount: ExpectedDelegationAmount = {
        validatorAddress,
        expectedAmount: expectedAmountAfterUnbond,
        lastUpdated: Date.now(),
      };

      setExpectedAmounts((prev) => [
        ...prev.filter((e) => e.validatorAddress !== validatorAddress),
        expectedAmount,
      ]);

      try {
        const unstakeMsg = babylon.txs.baby.createUnstakeMsg({
          validatorAddress,
          delegatorAddress: bech32Address,
          amount: unbondAmount,
        });

        const signedTx = await signBbnTx(unstakeMsg);
        const result = await sendBbnTx(signedTx);

        await Promise.all([
          refetchDelegations(),
          refetchUnbondingDelegations(),
        ]);

        return result;
      } catch (error) {
        setExpectedAmounts((prev) =>
          prev.filter((e) => e.validatorAddress !== validatorAddress),
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

  const clearPendingUnbonding = useCallback((validatorAddress?: string) => {
    if (validatorAddress) {
      setExpectedAmounts((prev) =>
        prev.filter((e) => e.validatorAddress !== validatorAddress),
      );
    } else {
      setExpectedAmounts([]);
    }
  }, []);

  return {
    loading: isLoading || isUnbondingLoading,
    delegations: groupedDelegations,
    stake,
    unstake,
    estimateStakingFee,
    clearPendingUnbonding,
  };
}
