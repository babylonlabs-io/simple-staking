"use client";

import { List } from "@babylonlabs-io/core-ui";

import { useLanguage } from "@/app/contexts/LanguageContext";
import { useUTXOs } from "@/app/hooks/client/api/useUTXOs";
import { useRewardsService } from "@/app/hooks/services/useRewardsService";
import { useIsMobileView } from "@/app/hooks/useBreakpoint";
import { useBalanceState } from "@/app/state/BalanceState";
import { useRewardsState } from "@/app/state/RewardState";
import { translations } from "@/app/translations";
import { AuthGuard } from "@/components/common/AuthGuard";
import { getNetworkConfigBBN } from "@/config/network/bbn";
import { getNetworkConfigBTC } from "@/config/network/btc";
import { ubbnToBaby } from "@/utils/bbn";

import { ClaimRewardModal } from "../Modals/ClaimRewardModal";
import { ClaimStatusModal } from "../Modals/ClaimStatusModal/ClaimStatusModal";
import { Section } from "../Section/Section";
import { ActionComponent } from "../Stats/ActionComponent";
import { LoadingStyle, StatItem } from "../Stats/StatItem";

const { networkName: bbnNetworkName, coinSymbol: bbnCoinSymbol } =
  getNetworkConfigBBN();
const { coinSymbol } = getNetworkConfigBTC();

export function PersonalBalanceStaked() {
  const { language } = useLanguage();
  const t = translations[language];

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
  const formattedRewardBalance = rewardBalance
    ? ubbnToBaby(rewardBalance).toFixed(6)
    : "0.000000";

  return (
    <AuthGuard>
      <Section
        title={t.babylonBalance}
        titleClassName="md:text-3xl font-semiBold"
      >
        <List orientation="horizontal" className="border-0">
          {/* <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-2"> */}
          {/* <StatItem
            loading={isBalanceLoading}
            title={t.stakedBalance}
            value={`${satoshiToBtc(stakedBtcBalance)} ${coinSymbol}`}
            className="flex-col items-start border-b-0 gap-2"
          /> */}

          {/* <StatItem
            loading={isBalanceLoading || hasUnconfirmedUTXOs}
            title={t.stakableBalance}
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
            className="flex-row"
          />
          */}
          <StatItem
            loading={isBalanceLoading || processing}
            title={`${isMobile ? "BABY" : bbnNetworkName} ${t.bbnBalance}`}
            value={
              isBalanceLoading || processing
                ? ""
                : `${ubbnToBaby(bbnBalance)} ${bbnCoinSymbol}`
            }
            loadingStyle={LoadingStyle.ShowSpinner}
            className="flex-col items-start gap-2 border-b-0 p-0"
          />

          <StatItem
            loading={rewardLoading}
            title={`${isMobile ? "BABY" : bbnNetworkName} ${t.bbnRewards}`}
            value={`${formattedRewardBalance} ${bbnCoinSymbol}`}
            suffix={
              <ActionComponent
                className="h-6"
                title={t.claim}
                onAction={showPreview}
                isDisabled={!rewardBalance || processing}
              />
            }
            className="flex-col items-start gap-2"
          />
          {/* </div> */}
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

        <ClaimStatusModal
          open={showProcessingModal}
          onClose={() => {
            closeProcessingModal();
            setTransactionHash("");
          }}
          loading={processing}
          transactionHash={transactionHash}
        />
      </Section>
    </AuthGuard>
  );
}
