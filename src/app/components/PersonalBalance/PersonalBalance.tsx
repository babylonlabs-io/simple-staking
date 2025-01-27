import { Card } from "@babylonlabs-io/bbn-core-ui";

import { useRewardsService } from "@/app/hooks/services/useRewardsService";
import { useAppState } from "@/app/state";
import { useRewardsState } from "@/app/state/RewardState";
import { AuthGuard } from "@/components/common/AuthGuard";
import { getNetworkConfigBBN } from "@/config/network/bbn";
import { getNetworkConfigBTC } from "@/config/network/btc";
import { ubbnToBaby } from "@/utils/bbn";
import { satoshiToBtc } from "@/utils/btc";

import { ClaimRewardModal } from "../Modals/ClaimRewardModal";
import { Section } from "../Section/Section";
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
    stakableBtcBalance,
    totalBtcBalance,
    bbnBalance,
    rewardBalance,
    transactionFee,
    closeRewardModal,
  } = useRewardsState();
  const { claimRewards, showPreview } = useRewardsService();
  const { ordinalsExcluded, hasOrdinals } = useAppState();

  const formattedRewardBalance = ubbnToBaby(rewardBalance);

  return (
    <AuthGuard>
      <Section title="Wallet Balance">
        <Card className="flex flex-col justify-between text-base md:flex-row">
          <StatItem
            loading={loading}
            title={`Total ${coinName} Balance`}
            value={`${satoshiToBtc(totalBtcBalance)} ${coinSymbol}`}
            tooltip={
              hasOrdinals && ordinalsExcluded
                ? `You have ${satoshiToBtc(totalBtcBalance - stakableBtcBalance)} ${coinSymbol} that contains inscriptions. To use this in your stakable balance unlock them within the menu.`
                : undefined
            }
          />

          <div className="divider mx-0 my-2 md:divider-horizontal" />

          <StatItem
            loading={loading}
            title={"Stakable Balance"}
            value={`${satoshiToBtc(stakableBtcBalance)} ${coinSymbol}`}
          />

          <div className="divider mx-0 my-2 md:divider-horizontal" />

          <StatItem
            loading={loading}
            title={`${bbnNetworkName} Balance`}
            value={`${ubbnToBaby(bbnBalance)} ${bbnCoinSymbol}`}
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
        </Card>

        <ClaimRewardModal
          processing={processing}
          open={showRewardModal}
          onClose={closeRewardModal}
          onSubmit={claimRewards}
          receivingValue={`${formattedRewardBalance}`}
          address={bbnAddress}
          transactionFee={transactionFee}
        />
      </Section>
    </AuthGuard>
  );
}
