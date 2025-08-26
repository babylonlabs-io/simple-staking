import { useCallback, useMemo } from "react";

import babylon from "@/infrastructure/babylon";
import { useDelegations } from "@/ui/baby/hooks/api/useDelegations";
import { useUnbondingDelegations } from "@/ui/baby/hooks/api/useUnbondingDelegations";
import { usePendingOperationsService } from "@/ui/baby/hooks/services/usePendingOperationsService";
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
  statusSuffix?: string;
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

export function useDelegationService() {
  const { bech32Address } = useCosmosWallet();
  const {
    pendingOperations,
    addPendingOperation,
    getPendingStake,
    getPendingUnstake,
  } = usePendingOperationsService();

  const { data: delegations = [], isLoading } = useDelegations(bech32Address);
  const { data: unbondingDelegations = [], isLoading: isUnbondingLoading } =
    useUnbondingDelegations();
  const { signBbnTx, sendBbnTx, estimateBbnGasFee } = useBbnTransaction();
  const { validatorMap, loading: isValidatorLoading } = useValidatorService();

  const groupedDelegations = useMemo(() => {
    if (isValidatorLoading) {
      return [];
    }

    const unbondingValidatorAddresses = new Set<string>();
    const unbondingInfoByValidator: Record<string, UnbondingInfo> = {};

    // Process real unbonding delegations from API
    unbondingDelegations.forEach((unbonding: any) => {
      const validatorAddress =
        unbonding.validatorAddress || unbonding.validator_address;
      const entries = unbonding.entries || [];

      if (validatorAddress && entries.length > 0) {
        unbondingValidatorAddresses.add(validatorAddress);
        const firstEntry = entries[0];
        unbondingInfoByValidator[validatorAddress] = {
          amount: BigInt(firstEntry.balance || firstEntry.initial_balance || 0),
        };
      }
    });

    // Process pending operations
    pendingOperations.forEach((operation) => {
      if (operation.operationType === "unstake") {
        unbondingValidatorAddresses.add(operation.validatorAddress);
        unbondingInfoByValidator[operation.validatorAddress] = {
          amount: operation.amount,
          statusSuffix: " (pending...)",
        };
      }
    });

    const result = Object.values(
      delegations.reduce(
        (acc, item) => {
          const validatorAddress = item.delegation.validatorAddress;
          const apiAmount = BigInt(item.balance.amount);

          // Find pending operations for this validator
          const pendingStake = getPendingStake(validatorAddress);
          const pendingUnstake = getPendingUnstake(validatorAddress);

          let effectiveAmount = apiAmount;
          let status: DelegationStatus = "active";

          if (pendingStake) {
            effectiveAmount += pendingStake.amount;
            status = "pending";
          }

          if (pendingUnstake) {
            effectiveAmount =
              effectiveAmount > pendingUnstake.amount
                ? effectiveAmount - pendingUnstake.amount
                : 0n;
            status = "unbonding";
          } else if (unbondingInfoByValidator[validatorAddress]) {
            const unbondingAmount =
              unbondingInfoByValidator[validatorAddress].amount;
            effectiveAmount =
              effectiveAmount >= unbondingAmount
                ? effectiveAmount - unbondingAmount
                : 0n;
            status = "unbonding";
          }

          if (acc[validatorAddress]) {
            acc[validatorAddress].shares += parseFloat(item.delegation.shares);
            acc[validatorAddress].amount += effectiveAmount;
            if (status !== "active") {
              acc[validatorAddress].status = status;
              acc[validatorAddress].unbondingInfo =
                status === "unbonding"
                  ? unbondingInfoByValidator[validatorAddress]
                  : undefined;
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

    // Add pending stakes for validators not yet in API
    pendingOperations
      .filter((op) => op.operationType === "stake")
      .forEach((operation) => {
        const validatorAddress = operation.validatorAddress;
        if (!result.find((d) => d.validator.address === validatorAddress)) {
          const validator = validatorMap[validatorAddress];
          if (validator) {
            result.push({
              validator,
              delegatorAddress: bech32Address || "",
              shares: 0,
              amount: operation.amount,
              coin: "ubbn",
              status: "pending",
            });
          }
        }
      });

    return result;
  }, [
    delegations,
    validatorMap,
    isValidatorLoading,
    unbondingDelegations,
    pendingOperations,
    bech32Address,
    getPendingStake,
    getPendingUnstake,
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

      const stakeMsg = babylon.txs.baby.createStakeMsg({
        validatorAddress,
        delegatorAddress: bech32Address,
        amount: stakeAmount,
      });

      const signedTx = await signBbnTx(stakeMsg);

      return { signedTx };
    },
    [bech32Address, signBbnTx],
  );

  /**
   * unstake is used to sign the unstake message and return the signed transaction
   * it does not send the transaction to the network
   */
  const unstake = useCallback(
    async ({ validatorAddress, amount: amountInUbbn }: StakingParams) => {
      if (!bech32Address) throw Error("Babylon Wallet is not connected");

      const unbondAmount = BigInt(amountInUbbn);

      const unstakeMsg = babylon.txs.baby.createUnstakeMsg({
        validatorAddress,
        delegatorAddress: bech32Address,
        amount: unbondAmount,
      });

      const signedTx = await signBbnTx(unstakeMsg);

      return { signedTx };
    },
    [bech32Address, signBbnTx],
  );

  /**
   * sendTx is used to send the signed transaction to the network
   */
  const sendTx = useCallback(
    async (
      signedTx: Uint8Array,
      operationType: "stake" | "unstake",
      validatorAddress: string,
      amount: bigint,
    ) => {
      const result = await sendBbnTx(signedTx);

      // Only add pending operation after successful transaction submission
      addPendingOperation(validatorAddress, amount, operationType);

      return result;
    },
    [sendBbnTx, addPendingOperation],
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
