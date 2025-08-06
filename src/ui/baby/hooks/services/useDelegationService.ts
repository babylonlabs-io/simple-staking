import { useCallback, useMemo } from "react";

import babylon from "@/infrastructure/babylon";
import { useDelegations } from "@/ui/baby/hooks/api/useDelegations";
import {
  type Validator,
  useValidatorService,
} from "@/ui/baby/hooks/services/useValidatorService";
import { useCosmosWallet } from "@/ui/common/context/wallet/CosmosWalletProvider";
import { useBbnTransaction } from "@/ui/common/hooks/client/rpc/mutation/useBbnTransaction";
import { useEventEmitter } from "@/ui/common/hooks/useEventBus";
import { EVENTS } from "@/ui/common/utils/eventBus";

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
}

export function useDelegationService() {
  const { bech32Address } = useCosmosWallet();
  const {
    data: delegations = [],
    refetch: refetchDelegations,
    isLoading,
  } = useDelegations(bech32Address);
  const { signBbnTx, sendBbnTx, estimateBbnGasFee } = useBbnTransaction();
  const { validatorMap, loading: isValidatorLoading } = useValidatorService();
  const { emit } = useEventEmitter();

  const groupedDelegations = useMemo(
    () =>
      !isValidatorLoading
        ? Object.values(
            delegations.reduce(
              (acc, item) => {
                const delegation = acc[item.delegation.validatorAddress];
                if (delegation) {
                  delegation.shares += parseFloat(item.delegation.shares);
                  delegation.amount += BigInt(item.balance.amount);
                } else {
                  acc[item.delegation.validatorAddress] = {
                    validator: validatorMap[item.delegation.validatorAddress],
                    delegatorAddress: item.delegation.delegatorAddress,
                    shares: parseFloat(item.delegation.shares),
                    amount: BigInt(item.balance.amount),
                    coin: "ubbn",
                  };
                }
                return acc;
              },
              {} as Record<string, Delegation>,
            ),
          )
        : [],
    [delegations, validatorMap, isValidatorLoading],
  );

  const stake = useCallback(
    async ({ validatorAddress, amount }: StakingParams) => {
      if (!bech32Address) throw Error("Babylon Wallet is not connected");

      try {
        emit(EVENTS.TX_START, { type: "stake" });

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

        emit(EVENTS.TX_SUCCESS, { type: "stake", txHash: result?.txHash });
        emit(EVENTS.DELEGATIONS_REFRESH);

        await refetchDelegations();
        return result;
      } catch (error) {
        emit(EVENTS.TX_FAIL, { type: "stake", error: error as Error });
        throw error;
      }
    },
    [bech32Address, signBbnTx, sendBbnTx, refetchDelegations, emit],
  );

  const unstake = useCallback(
    async ({ validatorAddress, amount }: StakingParams) => {
      if (!bech32Address) throw Error("Babylon Wallet is not connected");

      try {
        emit(EVENTS.TX_START, { type: "unstake" });

        const unstakeMsg = babylon.txs.baby.createUnstakeMsg({
          validatorAddress,
          delegatorAddress: bech32Address,
          amount: babylon.utils.babyToUbbn(Number(amount)),
        });
        const signedTx = await signBbnTx(unstakeMsg);
        const result = await sendBbnTx(signedTx);

        emit(EVENTS.TX_SUCCESS, { type: "unstake", txHash: result?.txHash });
        emit(EVENTS.DELEGATIONS_REFRESH);

        await refetchDelegations();
        return result;
      } catch (error) {
        emit(EVENTS.TX_FAIL, { type: "unstake", error: error as Error });
        throw error;
      }
    },
    [bech32Address, signBbnTx, sendBbnTx, refetchDelegations, emit],
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
    loading: isLoading,
    delegations: groupedDelegations,
    stake,
    unstake,
    estimateStakingFee,
  };
}
