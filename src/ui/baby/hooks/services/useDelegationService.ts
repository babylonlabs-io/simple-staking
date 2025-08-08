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

interface DelegationStatusInfo {
  status: DelegationStatus;
  isActive: boolean;
  isUnbonding: boolean;
  isUnbonded: boolean;
  isPending: boolean;
}

export interface Delegation extends DelegationStatusInfo {
  validator: Validator;
  delegatorAddress: string;
  shares: number;
  amount: bigint;
  coin: "ubbn";
  unbondingInfo?: UnbondingInfo;
  hasPendingUnbonding?: boolean;
}

interface PendingStake {
  validatorAddress: string;
  amount: bigint;
  timestamp: number;
}

interface PendingUnbonding {
  validatorAddress: string;
  timestamp: number;
}

interface ExpectedDelegationAmount {
  validatorAddress: string;
  expectedAmount: bigint;
  lastUpdated: number;
}

const PENDING_STAKE_API_UPDATE_TIMEOUT_MS = 5000;
const PENDING_UNBONDING_TIMEOUT_MS = 2 * 60 * 1000;

function computeDelegationStatusInfo(
  status: DelegationStatus,
): DelegationStatusInfo {
  return {
    status,
    isActive: status === "active",
    isUnbonding: status === "unbonding",
    isUnbonded: status === "unbonded",
    isPending: status === "pending",
  };
}

export function useDelegationService() {
  const [pendingStakes, setPendingStakes] = useState<PendingStake[]>([]);
  const [pendingUnbondings, setPendingUnbondings] = useState<
    PendingUnbonding[]
  >([]);
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

    unbondingDelegations.forEach((unbonding) => {
      const { validatorAddress, entries } = unbonding;

      unbondingValidatorAddresses.add(validatorAddress);

      if (entries.length > 0) {
        const firstEntry = entries[0];
        unbondingInfoByValidator[validatorAddress] = {
          amount: BigInt(firstEntry.balance || firstEntry.initial_balance || 0),
          completionTime:
            firstEntry.completion_time || new Date().toISOString(),
        };
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
              const statusInfo = computeDelegationStatusInfo("unbonding");
              Object.assign(delegation, statusInfo);
              delegation.unbondingInfo =
                unbondingInfoByValidator[validatorAddress];
            }
          } else {
            const statusInfo = computeDelegationStatusInfo(status);
            acc[validatorAddress] = {
              validator: validatorMap[validatorAddress],
              delegatorAddress: item.delegation.delegatorAddress,
              shares: parseFloat(item.delegation.shares),
              amount: effectiveAmount,
              coin: "ubbn",
              ...statusInfo,
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
            const pendingStatusInfo = computeDelegationStatusInfo("pending");
            Object.assign(existingDelegation, pendingStatusInfo);
          }
        } else {
          const pendingStatusInfo = computeDelegationStatusInfo("pending");
          result.push({
            validator,
            delegatorAddress: bech32Address || "",
            shares: 0,
            amount: pendingStake.amount,
            coin: "ubbn",
            ...pendingStatusInfo,
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

    const pendingUnbondingsToRemove: PendingUnbonding[] = [];

    pendingUnbondings.forEach((pendingUnbonding) => {
      const existingDelegation = result.find(
        (d) => d.validator.address === pendingUnbonding.validatorAddress,
      );

      if (existingDelegation) {
        const hasTimePassedForUnbondingUpdate =
          Date.now() - pendingUnbonding.timestamp >
          PENDING_UNBONDING_TIMEOUT_MS;

        if (hasTimePassedForUnbondingUpdate) {
          pendingUnbondingsToRemove.push(pendingUnbonding);
        } else {
          existingDelegation.hasPendingUnbonding = true;
        }
      } else {
        pendingUnbondingsToRemove.push(pendingUnbonding);
      }
    });

    if (pendingUnbondingsToRemove.length > 0) {
      const toRemoveSet = new Set(
        pendingUnbondingsToRemove.map(
          (toRemove) => `${toRemove.validatorAddress}:${toRemove.timestamp}`,
        ),
      );
      setPendingUnbondings((prev) =>
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
    pendingUnbondings,
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

      const pendingUnbonding: PendingUnbonding = {
        validatorAddress,
        timestamp: Date.now(),
      };

      setExpectedAmounts((prev) => [
        ...prev.filter((e) => e.validatorAddress !== validatorAddress),
        expectedAmount,
      ]);

      setPendingUnbondings((prev) => [
        ...prev.filter((u) => u.validatorAddress !== validatorAddress),
        pendingUnbonding,
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
        setPendingUnbondings((prev) =>
          prev.filter((u) => u.validatorAddress !== validatorAddress),
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
      setPendingUnbondings((prev) =>
        prev.filter((u) => u.validatorAddress !== validatorAddress),
      );
    } else {
      setExpectedAmounts([]);
      setPendingUnbondings([]);
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
