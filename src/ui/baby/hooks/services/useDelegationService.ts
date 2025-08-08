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

export interface Delegation {
  validator: Validator;
  delegatorAddress: string;
  shares: number;
  amount: bigint;
  coin: "ubbn";
  status?: DelegationStatus;
}

interface PendingStake {
  validatorAddress: string;
  amount: bigint;
  timestamp: number;
}

export function useDelegationService() {
  const [pendingUnbondingValidators, setPendingUnbondingValidators] = useState<
    Set<string>
  >(new Set());
  const [pendingStakes, setPendingStakes] = useState<PendingStake[]>([]);

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

    const unbondingValidatorAddresses = new Set(
      unbondingDelegations
        .map((unbonding: any) => {
          const validatorAddress =
            unbonding.validatorAddress ||
            unbonding.validator_address ||
            unbonding.validatorAddr;
          return validatorAddress;
        })
        .filter(Boolean),
    );

    pendingUnbondingValidators.forEach((validatorAddress) => {
      unbondingValidatorAddresses.add(validatorAddress);
    });

    const result = Object.values(
      delegations.reduce(
        (acc, item) => {
          const validatorAddress = item.delegation.validatorAddress;
          const delegation = acc[validatorAddress];

          const isUnbonding = unbondingValidatorAddresses.has(validatorAddress);
          const status: DelegationStatus = isUnbonding ? "unbonding" : "active";

          if (delegation) {
            delegation.shares += parseFloat(item.delegation.shares);
            delegation.amount += BigInt(item.balance.amount);
            if (status === "unbonding") {
              delegation.status = "unbonding";
            }
          } else {
            acc[validatorAddress] = {
              validator: validatorMap[validatorAddress],
              delegatorAddress: item.delegation.delegatorAddress,
              shares: parseFloat(item.delegation.shares),
              amount: BigInt(item.balance.amount),
              coin: "ubbn",
              status,
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
            Date.now() - pendingStake.timestamp > 5000;

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
      setPendingStakes((prev) =>
        prev.filter(
          (p) =>
            !pendingStakesToRemove.some(
              (toRemove) =>
                toRemove.validatorAddress === p.validatorAddress &&
                toRemove.timestamp === p.timestamp,
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
    pendingUnbondingValidators,
    pendingStakes,
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

      setPendingUnbondingValidators(
        (prev) => new Set([...prev, validatorAddress]),
      );

      try {
        const unstakeMsg = babylon.txs.baby.createUnstakeMsg({
          validatorAddress,
          delegatorAddress: bech32Address,
          amount: babylon.utils.babyToUbbn(Number(amount)),
        });

        const signedTx = await signBbnTx(unstakeMsg);
        const result = await sendBbnTx(signedTx);

        await Promise.all([
          refetchDelegations(),
          refetchUnbondingDelegations(),
        ]);

        return result;
      } catch (error) {
        setPendingUnbondingValidators((prev) => {
          const newSet = new Set(prev);
          newSet.delete(validatorAddress);
          return newSet;
        });
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
      setPendingUnbondingValidators((prev) => {
        const newSet = new Set(prev);
        newSet.delete(validatorAddress);
        return newSet;
      });
    } else {
      setPendingUnbondingValidators(new Set());
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
