import { Heading } from "@babylonlabs-io/bbn-core-ui";
import { useQuery } from "@tanstack/react-query";

import { useBTCWallet } from "@/app/context/wallet/BTCWalletProvider";
import { useCosmosWallet } from "@/app/context/wallet/CosmosWalletProvider";
import { useBbnQueryClient } from "@/app/hooks/client/query/useBbnQueryClient";
import { useRewardsService } from "@/app/hooks/services/useRewardsService";
import { getNetworkConfig } from "@/config/network.config";
import { ubbnToBbn } from "@/utils/bbn";
import { satoshiToBtc } from "@/utils/btc";

import { StatItem } from "../Stats/StatItem";

const QUERY_KEYS = {
  REWARDS: ["REWARDS"],
  BTC_BALANCE: ["BTC_BALANCE"],
  COSMOS_BALANCE: ["COSMOS_BALANCE"],
};

export function PersonalBalance() {
  const { coinName, coinSymbol } = getNetworkConfig();
  const { getBalance: getBTCBalance, connected: btcConnected } = useBTCWallet();
  const { connected: cosmosConnected } = useCosmosWallet();

  const {
    balanceQuery: { data: cosmosBalance, isLoading: cosmosBalanceLoading },
  } = useBbnQueryClient();
  const { getRewards, claimRewards } = useRewardsService();

  const { data: rewards, isLoading: rewardsLoading } = useQuery({
    queryKey: [QUERY_KEYS.REWARDS],
    queryFn: getRewards,
  });

  const { data: btcBalance, isLoading: btcBalanceLoading } = useQuery({
    queryKey: [QUERY_KEYS.BTC_BALANCE],
    queryFn: getBTCBalance,
    enabled: btcConnected,
  });

  if (!btcConnected || !cosmosConnected) {
    return null;
  }

  return (
    <div className="flex flex-col gap-4 p-1 xl:justify-between mb-12">
      <Heading variant="h4" className="text-primary-dark md:text-4xl">
        Wallet Balance
      </Heading>
      <div className="flex flex-col justify-between bg-secondary-contrast rounded p-6 text-base md:flex-row">
        {/* TODO: Need to add the staker tvl value for the bitcoin balance 
          as well as remove the filtering on inscription balance*/}
        <StatItem
          loading={btcBalanceLoading}
          title={`${coinName} Balance`}
          value={`${satoshiToBtc(btcBalance ?? 0)} ${coinSymbol}`}
        />

        <div className="divider mx-0 my-2 md:divider-horizontal" />

        <StatItem
          loading={cosmosBalanceLoading}
          title={`Stakable ${coinName}`}
          value={`${satoshiToBtc(btcBalance ?? 0)} ${coinSymbol}`}
        />

        <div className="divider mx-0 my-2 md:divider-horizontal" />

        <StatItem
          loading={cosmosBalanceLoading}
          title="Babylon Balance"
          value={`${ubbnToBbn(cosmosBalance ?? 0)} BBN`}
        />

        <div className="divider mx-0 my-2 md:divider-horizontal" />

        <StatItem
          loading={rewardsLoading}
          title="BBN Rewards"
          value={`${ubbnToBbn(rewards ?? 0)} BBN`}
          actionComponent={{
            title: "Claim",
            onAction: claimRewards,
          }}
        />
      </div>
    </div>
  );
}
