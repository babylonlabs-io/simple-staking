import { useCallback } from "react";

import { useCosmosWallet } from "@/app/context/wallet/CosmosWalletProvider";

export const useRewardsService = () => {
  const {
    connected: cosmosConnected,
    bech32Address,
    signingStargateClient,
    distributionQueryClient,
  } = useCosmosWallet();

  const getRewards = useCallback(async (): Promise<number> => {
    if (!cosmosConnected || !bech32Address || !signingStargateClient) {
      return 0;
    }
    // get public key
    const account = await signingStargateClient.getAccount(bech32Address);
    const publicKeyHex = Buffer.from(account?.pubkey?.value ?? "").toString(
      "hex",
    );
    console.log("publicKey", publicKeyHex);

    const result =
      await distributionQueryClient?.distribution.delegationTotalRewards(
        bech32Address,
      );
    if (!result) {
      throw new Error("Unable to fetch rewards");
    }
    console.log("result", result);
    // Sum up all the rewards into a single number
    const total = result.total.reduce((sum, coin) => {
      return sum + Number(coin.amount);
    }, 0);
    return total;
  }, [
    cosmosConnected,
    bech32Address,
    signingStargateClient,
    distributionQueryClient,
  ]);

  const claimRewards = useCallback(async () => {
    throw new Error("Not implemented");
  }, []);

  return {
    getRewards,
    claimRewards,
  };
};
