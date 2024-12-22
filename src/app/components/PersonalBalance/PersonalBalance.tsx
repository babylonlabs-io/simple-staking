import { Heading } from "@babylonlabs-io/bbn-core-ui";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

import { useBTCWallet } from "@/app/context/wallet/BTCWalletProvider";
import { useCosmosWallet } from "@/app/context/wallet/CosmosWalletProvider";
import { useBbnQuery } from "@/app/hooks/client/rpc/queries/useBbnQuery";
import { useRewardsService } from "@/app/hooks/services/useRewardsService";
import { notifySuccess } from "@/app/hooks/useNotification";
import { getNetworkConfig } from "@/config/network.config";
import { ubbnToBbn } from "@/utils/bbn";
import { satoshiToBtc } from "@/utils/btc";

import { ClaimRewardModal } from "../Modals/ClaimRewardModal";
import { StatItem } from "../Stats/StatItem";

const QUERY_KEYS = {
  REWARDS: ["REWARDS"],
  BTC_BALANCE: ["BTC_BALANCE"],
  COSMOS_BALANCE: ["COSMOS_BALANCE"],
};

export function PersonalBalance() {
  const { coinName, coinSymbol } = getNetworkConfig();
  const {
    getBalance: getBTCBalance,
    connected: btcConnected,
    address,
  } = useBTCWallet();
  const { connected: cosmosConnected } = useCosmosWallet();

  const {
    balanceQuery: { data: cosmosBalance, isLoading: cosmosBalanceLoading },
  } = useBbnQuery();
  const { claimRewards } = useRewardsService();
  const { rewardsQuery } = useBbnQuery();
  const [showClaimRewardModal, setShowClaimRewardModal] = useState(false);

  const claimAction = async () => {
    setShowClaimRewardModal(false);
    notifySuccess("Claim Processing", "more info");
    await claimRewards();
    notifySuccess("Successfully Claimed tBABY", "more info");
  };

  const { data: btcBalance, isLoading: btcBalanceLoading } = useQuery({
    queryKey: [QUERY_KEYS.BTC_BALANCE],
    queryFn: () => getBTCBalance(address),
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
          title={"Stakable Balance"}
          value={`${satoshiToBtc(btcBalance ?? 0)} ${coinSymbol}`}
        />

        <div className="divider mx-0 my-2 md:divider-horizontal" />

        <StatItem
          loading={cosmosBalanceLoading}
          title="Babylon Chain Balance"
          value={`${ubbnToBbn(cosmosBalance ?? 0)} BBN`}
        />

        <div className="divider mx-0 my-2 md:divider-horizontal" />

        <StatItem
          loading={rewardsQuery.isLoading}
          title="BBN Rewards"
          value={`${ubbnToBbn(rewardsQuery.data ?? 0)} BBN`}
          actionComponent={{
            title: "Claim",
            onAction: () => setShowClaimRewardModal(true),
          }}
        />
      </div>
      <ClaimRewardModal
        open={showClaimRewardModal}
        onClose={() => setShowClaimRewardModal(false)}
        onSubmit={claimAction}
        receivingValue={`${ubbnToBbn(rewardsQuery.data ?? 0)}`}
        address="(placeholder)bbn170...e9m94d"
        transactionFee="(placeholder)0.050"
      />
    </div>
  );
}
