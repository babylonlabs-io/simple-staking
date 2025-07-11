import { AuthGuard } from "@/ui/common/components/Common/AuthGuard";
import { getNetworkConfigBBN } from "@/ui/common/config/network/bbn";
import { getNetworkConfigBTC } from "@/ui/common/config/network/btc";
import { useUTXOs } from "@/ui/common/hooks/client/api/useUTXOs";
import { useRewardsService } from "@/ui/common/hooks/services/useRewardsService";
import { useIsMobileView } from "@/ui/common/hooks/useBreakpoint";
import { useBalanceState } from "@/ui/common/state/BalanceState";
import { useRewardsState } from "@/ui/common/state/RewardState";
import { ubbnToBaby } from "@/ui/common/utils/bbn";
import { satoshiToBtc } from "@/ui/common/utils/btc";

import { ClaimRewardModal } from "../Modals/ClaimRewardModal";
import { ClaimStatusModal } from "../Modals/ClaimStatusModal/ClaimStatusModal";
import { Section } from "../Section/Section";
import { ActionComponent } from "../Stats/ActionComponent";
import { LoadingStyle, StatItem } from "../Stats/StatItem";

const { networkName: bbnNetworkName, coinSymbol: bbnCoinSymbol } =
  getNetworkConfigBBN();
const { coinSymbol, networkName } = getNetworkConfigBTC();

export function PersonalBalance() {
  // Load reward state
  const {
    loading: rewardLoading,
    processing,
    showRewardModal,
    showProcessingModal,
    closeProcessingModal,
    closeRewardModal,
    bbnAddress,
    rewardBalance,
    transactionFee,
    transactionHash,
    setTransactionHash,
  } = useRewardsState();

  // Load balance state
  const {
    bbnBalance,
    stakableBtcBalance,
    stakedBtcBalance,
    inscriptionsBtcBalance,
    loading: isBalanceLoading,
  } = useBalanceState();

  const { allUTXOs = [], confirmedUTXOs = [] } = useUTXOs();
  const hasUnconfirmedUTXOs = allUTXOs.length > confirmedUTXOs.length;

  const { claimRewards, showPreview } = useRewardsService();

  const isMobile = useIsMobileView();
  const formattedRewardBalance = ubbnToBaby(rewardBalance);

  return (
    <AuthGuard>
      <Section
        title={`${networkName} Balances`}
        titleClassName="md:text-[1.25rem] mt-10"
      >
        <StatItem
          loading={isBalanceLoading}
          title="Staked Balance"
          value={`${satoshiToBtc(stakedBtcBalance)} ${coinSymbol}`}
        />

        <StatItem
          loading={isBalanceLoading || hasUnconfirmedUTXOs}
          title="Stakable Balance"
          loadingStyle={
            hasUnconfirmedUTXOs
              ? LoadingStyle.ShowSpinnerAndValue
              : LoadingStyle.ShowSpinner
          }
          value={`${satoshiToBtc(stakableBtcBalance)} ${coinSymbol}`}
          tooltip={
            inscriptionsBtcBalance
              ? `You have ${satoshiToBtc(inscriptionsBtcBalance)} ${coinSymbol} that contains inscriptions. To use this in your stakable balance unlock them within the menu.`
              : undefined
          }
        />
      </Section>

      <Section
        title={`${bbnNetworkName} Balances`}
        titleClassName="md:text-[1.25rem] mt-10"
      >
        <StatItem
          loading={isBalanceLoading || processing}
          title={`${isMobile ? "BABY" : bbnNetworkName} Balance`}
          value={
            isBalanceLoading || processing
              ? ""
              : `${ubbnToBaby(bbnBalance)} ${bbnCoinSymbol}`
          }
          loadingStyle={LoadingStyle.ShowSpinner}
        />

        <StatItem
          loading={rewardLoading}
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
      </Section>

      <ClaimRewardModal
        processing={processing}
        open={showRewardModal}
        onClose={closeRewardModal}
        onSubmit={claimRewards}
        receivingValue={`${formattedRewardBalance}`}
        address={bbnAddress}
        transactionFee={transactionFee}
      />

      <ClaimStatusModal
        open={showProcessingModal}
        onClose={() => {
          closeProcessingModal();
          setTransactionHash("");
        }}
        loading={processing}
        transactionHash={transactionHash}
      />
    </AuthGuard>
  );
}
