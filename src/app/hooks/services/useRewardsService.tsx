import { incentivetx } from "@babylonlabs-io/babylon-proto-ts";
import { useCallback } from "react";

import { useCosmosWallet } from "@/app/context/wallet/CosmosWalletProvider";
import { estimateBbnGasFee } from "@/utils/delegations/fee";

import { useBbnQuery } from "../client/query/useBbnQuery";

export const useRewardsService = () => {
  const {
    connected: cosmosConnected,
    bech32Address,
    signingStargateClient,
  } = useCosmosWallet();

  const { getRewards: getBbnRewards } = useBbnQuery();

  /**
   * Gets the rewards from the user's account.
   * @returns {Promise<number>} The rewards from the user's account.
   */
  const getRewards = useCallback(async (): Promise<number> => {
    if (!cosmosConnected || !bech32Address || !signingStargateClient) {
      return 0;
    }
    return getBbnRewards();
  }, [cosmosConnected, bech32Address, signingStargateClient, getBbnRewards]);

  /**
   * Claims the rewards from the user's account.
   */
  const claimRewards = useCallback(async () => {
    if (!signingStargateClient || !bech32Address) {
      return;
    }

    const withdrawRewardMsg = incentivetx.MsgWithdrawReward.fromPartial({
      address: bech32Address,
    });
    const msg = {
      typeUrl: "/babylon.incentive.Msg/WithdrawReward",
      value: withdrawRewardMsg,
    };

    const fee = await estimateBbnGasFee(
      signingStargateClient?.simulate,
      bech32Address,
      msg,
    );
    await signingStargateClient.signAndBroadcast(bech32Address, [msg], fee);
  }, [bech32Address, signingStargateClient]);

  return {
    getRewards,
    claimRewards,
  };
};
