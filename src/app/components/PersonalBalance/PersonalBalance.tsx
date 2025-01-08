import { Heading } from "@babylonlabs-io/bbn-core-ui";
import { useMemo } from "react";

import { useRewardsService } from "@/app/hooks/services/useRewardsService";
import { useDelegationV2State } from "@/app/state/DelegationV2State";
import { useRewardsState } from "@/app/state/RewardState";
import { AuthGuard } from "@/components/common/AuthGuard";
import { getNetworkConfigBBN } from "@/config/network/bbn";
import { getNetworkConfigBTC } from "@/config/network/btc";
import { ubbnToBbn } from "@/utils/bbn";
import { satoshiToBtc } from "@/utils/btc";

import { ClaimRewardModal } from "../Modals/ClaimRewardModal";
import { StatItem } from "../Stats/StatItem";

const { networkName: bbnNetworkName, coinSymbol: bbnCoinSymbol } =
  getNetworkConfigBBN();
const { coinName, coinSymbol } = getNetworkConfigBTC();

export function PersonalBalance() {
  const {
    loading,
    processing,
    showRewardModal,
    bbnAddress,
    btcBalance,
    bbnBalance,
    rewardBalance,
    transactionFee,
    closeRewardModal,
  } = useRewardsState();
  const { getStakedBalance } = useDelegationV2State();
  const { claimRewards, showPreview } = useRewardsService();

  const totalBTCBalance = useMemo(
    () => (btcBalance ?? 0) + getStakedBalance(),
    [btcBalance, getStakedBalance],
  );

  const formattedRewardBalance = ubbnToBbn(rewardBalance);

  return (
    <AuthGuard>
      <div className="flex flex-col gap-4 p-1 xl:justify-between mb-12">
        <Heading variant="h4" className="text-primary-dark md:text-4xl">
          Wallet Balance
        </Heading>
        <div className="flex flex-col justify-between bg-secondary-contrast rounded p-6 text-base md:flex-row border border-primary-dark/20">
          <StatItem
            loading={loading}
            title={`Total ${coinName} Balance`}
            value={`${satoshiToBtc(totalBTCBalance)} ${coinSymbol}`}
          />

          <div className="divider mx-0 my-2 md:divider-horizontal" />

          <StatItem
            loading={loading}
            title={"Stakable Balance"}
            value={`${satoshiToBtc(btcBalance)} ${coinSymbol}`}
          />

          <div className="divider mx-0 my-2 md:divider-horizontal" />

          <StatItem
            loading={loading}
            title={`${bbnNetworkName} Balance`}
            value={`${ubbnToBbn(bbnBalance)} ${bbnCoinSymbol}`}
          />

          <div className="divider mx-0 my-2 md:divider-horizontal" />

          <StatItem
            loading={loading}
            title={`${bbnNetworkName} Rewards`}
            value={`${formattedRewardBalance} ${bbnCoinSymbol}`}
            actionComponent={{
              title: "Claim",
              onAction: showPreview,
              isDisabled: !rewardBalance || processing,
            }}
          />
        </div>

        <ClaimRewardModal
          processing={processing}
          open={showRewardModal}
          onClose={closeRewardModal}
          onSubmit={claimRewards}
          receivingValue={`${formattedRewardBalance}`}
          address={bbnAddress}
          transactionFee={transactionFee}
        />
      </div>
    </AuthGuard>
  );
}
