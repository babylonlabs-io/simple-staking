import { Heading } from "@babylonlabs-io/bbn-core-ui";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

import { useBTCWallet } from "@/app/context/wallet/BTCWalletProvider";
import { useCosmosWallet } from "@/app/context/wallet/CosmosWalletProvider";
import { useBbnQuery } from "@/app/hooks/client/rpc/queries/useBbnQuery";
import { useRewardsService } from "@/app/hooks/services/useRewardsService";
import { getNetworkConfigBTC } from "@/config/network/btc";
import { getNetworkConfigBBN } from "@/config/network/bbn";
import { ubbnToBbn } from "@/utils/bbn";
import { satoshiToBtc } from "@/utils/btc";

import { ClaimRewardModal } from "../Modals/ClaimRewardModal";
import { StatItem } from "../Stats/StatItem";

const QUERY_KEYS = {
  REWARDS: ["REWARDS"],
  BTC_BALANCE: ["BTC_BALANCE"],
  COSMOS_BALANCE: ["COSMOS_BALANCE"],
};
const {
  networkName: bbnNetworkName,
  coinSymbol: bbnCoinSymbol,
} = getNetworkConfigBBN();
const { coinName, coinSymbol } = getNetworkConfigBTC();

export function PersonalBalance() {
  const {
    getBalance: getBTCBalance,
    connected: btcConnected,
    address,
  } = useBTCWallet();
  const { connected: cosmosConnected, bech32Address } = useCosmosWallet();

  const {
    balanceQuery: { data: cosmosBalance, isLoading: cosmosBalanceLoading },
  } = useBbnQuery();
  const { claimRewards, estimateClaimRewardsGas } = useRewardsService();
  const { rewardsQuery } = useBbnQuery();
  const [showClaimRewardModal, setShowClaimRewardModal] = useState(false);

  const claimAction = async () => {
    setShowClaimRewardModal(false);
    await claimRewards();
  };

  const { data: btcBalance, isLoading: btcBalanceLoading } = useQuery({
    queryKey: [QUERY_KEYS.BTC_BALANCE],
    queryFn: () => getBTCBalance(address),
    enabled: btcConnected,
  });

  if (!btcConnected || !cosmosConnected) {
    return null;
  }

  const rewardBalance = ubbnToBbn(rewardsQuery.data ?? 0);

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
          title={`${bbnNetworkName} Balance`}
          value={`${ubbnToBbn(cosmosBalance ?? 0)} ${bbnCoinSymbol}`}
        />

        <div className="divider mx-0 my-2 md:divider-horizontal" />

        <StatItem
          loading={rewardsQuery.isLoading}
          title={`${bbnNetworkName} Rewards`}
          value={`${rewardBalance} ${bbnCoinSymbol}`}
          actionComponent={{
            title: "Claim",
            onAction: () => setShowClaimRewardModal(true),
            isDisabled: rewardBalance === 0,
          }}
        />
      </div>
      {showClaimRewardModal && (
        <ClaimRewardModal
          open={showClaimRewardModal}
          onClose={() => setShowClaimRewardModal(false)}
          onSubmit={claimAction}
          receivingValue={`${rewardBalance}`}
          address={bech32Address}
          getTransactionFee={estimateClaimRewardsGas}
        />
      )}
    </div>
  );
}
