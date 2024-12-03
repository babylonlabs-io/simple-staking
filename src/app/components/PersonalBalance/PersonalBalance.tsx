import { Heading } from "@babylonlabs-io/bbn-core-ui";
import { useEffect, useState } from "react";

import { useBTCWallet } from "@/app/context/wallet/BTCWalletProvider";
import { useCosmosWallet } from "@/app/context/wallet/CosmosWalletProvider";
import { useBbnQueryClient } from "@/app/hooks/client/query/useBbnQueryClient";
import { useRewardsService } from "@/app/hooks/services/useRewardsService";
import { ubbnToBbn } from "@/utils/bbn";
import { satoshiToBtc } from "@/utils/btc";

import { StatItem } from "../Stats/StatItem";

export function PersonalBalance() {
  const { getBalance: getBTCBalance, connected: btcConnected } = useBTCWallet();
  const { connected: cosmosConnected } = useCosmosWallet();

  const { getBalance } = useBbnQueryClient();
  const { getRewards } = useRewardsService();
  const [rewards, setRewards] = useState<number>();
  const [btcBalance, setBTCBalance] = useState<number>();
  const [cosmosBalance, setCosmosBalance] = useState<number>();
  const { claimRewards } = useRewardsService();

  useEffect(() => {
    const fetchRewards = async () => {
      const result = await getRewards();
      setRewards(result);
    };
    const fetchBTCBalance = async () => {
      const balance = await getBTCBalance();
      setBTCBalance(balance);
    };
    const fetchCosmosBalance = async () => {
      const bbnAmount = await getBalance();
      setCosmosBalance(bbnAmount);
    };
    fetchRewards();
    fetchBTCBalance();
    fetchCosmosBalance();
  }, [getRewards, getBTCBalance, getBalance]);

  if (!btcConnected || !cosmosConnected) {
    return null;
  }

  return (
    <div className="flex flex-col gap-4 p-1 xl:justify-between mb-12">
      <Heading variant="h5" className="text-primary-dark md:text-4xl">
        Wallet Balance
      </Heading>
      <div className="flex flex-col justify-between bg-secondary-contrast rounded p-6 text-base md:flex-row">
        {/* TODO: Need to add the staker tvl value for the bitcoin balance 
          as well as remove the filtering on inscription balance*/}
        <StatItem
          loading={false}
          title="Bitcoin Balance"
          value={`${satoshiToBtc(btcBalance ?? 0)} BTC`}
        />

        <div className="divider mx-0 my-2 md:divider-horizontal" />

        <StatItem
          loading={false}
          title="Stakable Bitcoin"
          value={`${satoshiToBtc(btcBalance ?? 0)} BTC`}
        />

        <div className="divider mx-0 my-2 md:divider-horizontal" />

        <StatItem
          loading={false}
          title="Babylon Balance"
          value={`${ubbnToBbn(cosmosBalance ?? 0)} BBN`}
        />

        <div className="divider mx-0 my-2 md:divider-horizontal" />

        <StatItem
          loading={false}
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
