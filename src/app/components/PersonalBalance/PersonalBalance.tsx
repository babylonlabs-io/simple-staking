import { List } from "@babylonlabs-io/core-ui";

import { useRewardsService } from "@/app/hooks/services/useRewardsService";
import { useIsMobileView } from "@/app/hooks/useBreakpoint";
import { useBalanceState } from "@/app/state/BalanceState";
import { useRewardsState } from "@/app/state/RewardState";
import { AuthGuard } from "@/components/common/AuthGuard";
import { getNetworkConfigBBN } from "@/config/network/bbn";
import { getNetworkConfigBTC } from "@/config/network/btc";
import { ubbnToBaby } from "@/utils/bbn";
import { satoshiToBtc } from "@/utils/btc";

import { ClaimRewardModal } from "../Modals/ClaimRewardModal";
import { Section } from "../Section/Section";
import { ActionComponent } from "../Stats/ActionComponent";
import { StatItem } from "../Stats/StatItem";

const { networkName: bbnNetworkName, coinSymbol: bbnCoinSymbol } =
  getNetworkConfigBBN();
const { coinName, coinSymbol } = getNetworkConfigBTC();

export function PersonalBalance() {
  // Load reward state
  const {
    loading,
    processing,
    showRewardModal,
    bbnAddress,
    rewardBalance,
    transactionFee,
    closeRewardModal,
  } = useRewardsState();

  // Load balance state
  const {
    bbnBalance,
    stakableBtcBalance,
    inscriptionsBtcBalance,
    combinedTotalBtcBalance,
  } = useBalanceState();

  const { claimRewards, showPreview } = useRewardsService();
  const isMobile = useIsMobileView();
  const formattedRewardBalance = ubbnToBaby(rewardBalance);

  return (
    <AuthGuard>
      <Section title="Wallet Balance">
        <List orientation="adaptive" className="bg-surface">
          <StatItem
            loading={loading}
            title={isMobile ? "Total Balance" : `Total ${coinName} Balance`}
            value={`${satoshiToBtc(combinedTotalBtcBalance)} ${coinSymbol}`}
            tooltip={
              inscriptionsBtcBalance
                ? `You have ${satoshiToBtc(inscriptionsBtcBalance)} ${coinSymbol} that contains inscriptions. To use this in your stakable balance unlock them within the menu.`
                : undefined
            }
          />

          <StatItem
            loading={loading}
            title={"Stakable Balance"}
            value={`${satoshiToBtc(stakableBtcBalance)} ${coinSymbol}`}
          />

          <StatItem
            loading={loading}
            title={`${isMobile ? "BABY" : bbnNetworkName} Balance`}
            value={`${ubbnToBaby(bbnBalance)} ${bbnCoinSymbol}`}
          />

          <StatItem
            loading={loading}
            title={`${isMobile ? "BABY" : bbnNetworkName} Rewards`}
            value={`${formattedRewardBalance} ${bbnCoinSymbol}`}
            suffix={
              <ActionComponent
                className="h-6"
                title="Claim"
                onAction={showPreview}
                isDisabled={!rewardBalance || processing}
              />
            }
          />
        </List>

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
