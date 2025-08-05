import { useCallback, useMemo } from "react";

import {
  estimateStakeFee,
  stake as stakeTx,
  unstake as unstakeTx,
} from "@/domain/services/delegationService";
import { useDelegations } from "@/ui/baby/hooks/api/useDelegations";
import {
  type Validator,
  useValidatorService,
} from "@/ui/baby/hooks/services/useValidatorService";
import { useCosmosWallet } from "@/ui/common/context/wallet/CosmosWalletProvider";
import { useBbnTransaction } from "@/ui/common/hooks/client/rpc/mutation/useBbnTransaction";

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

  const signAndBroadcast = useCallback(
    async (msgs: any | any[]) => {
      const signed = await signBbnTx(msgs);
      return sendBbnTx(signed);
    },
    [signBbnTx, sendBbnTx],
  );

  const stake = useCallback(
    async ({ validatorAddress, amount }: StakingParams) => {
      if (!bech32Address) throw Error("Babylon Wallet is not connected");
      const result = await stakeTx(
        { delegatorAddress: bech32Address, validatorAddress, amount },
        signAndBroadcast,
      );
      await refetchDelegations();
      return result;
    },
    [bech32Address, signAndBroadcast, refetchDelegations],
  );

  const unstake = useCallback(
    async ({ validatorAddress, amount }: StakingParams) => {
      if (!bech32Address) throw Error("Babylon Wallet is not connected");
      const result = await unstakeTx(
        { delegatorAddress: bech32Address, validatorAddress, amount },
        signAndBroadcast,
      );
      await refetchDelegations();
      return result;
    },
    [bech32Address, signAndBroadcast, refetchDelegations],
  );

  const estimateStakingFee = useCallback(
    async ({ validatorAddress, amount }: StakingParams) => {
      if (!bech32Address) throw Error("Babylon Wallet is not connected");
      return estimateStakeFee(
        { delegatorAddress: bech32Address, validatorAddress, amount },
        estimateBbnGasFee,
      );
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
