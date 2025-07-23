import { useCallback } from "react";

import babylon from "@/infrastructure/babylon";
import { useRewards } from "@/ui/baby/hooks/api/useRewards";
import { useError } from "@/ui/common/context/Error/ErrorProvider";
import { useCosmosWallet } from "@/ui/common/context/wallet/CosmosWalletProvider";
import { useBbnTransaction } from "@/ui/common/hooks/client/rpc/mutation/useBbnTransaction";
import { useLogger } from "@/ui/common/hooks/useLogger";

export function useRewardService() {
  const { bech32Address } = useCosmosWallet();
  const { data: rewards = [], refetch: refetchRewards } =
    useRewards(bech32Address);
  const { signBbnTx, sendBbnTx } = useBbnTransaction();
  const { handleError } = useError();
  const logger = useLogger();

  const claimReward = useCallback(
    async (validatorAddress: string) => {
      try {
        if (!bech32Address) throw Error("Babylon Wallet is not connected");

        const claimRewardMsg = babylon.txs.baby.createClaimRewardMsg({
          validatorAddress,
          delegatorAddress: bech32Address,
        });
        const signedTx = await signBbnTx(claimRewardMsg);
        const result = await sendBbnTx(signedTx);

        await logger.info("Baby Staking: claim reward", {
          txHash: result?.txHash,
        });
        await refetchRewards();
      } catch (error: any) {
        handleError({ error });
        logger.error(error);
      }
    },
    [logger, bech32Address, signBbnTx, sendBbnTx, refetchRewards, handleError],
  );

  return {
    rewards,
    claimReward,
  };
}
