import { useUTXOs } from "@/app/hooks/client/api/useUTXOs";
import { useRewardsService } from "@/app/hooks/services/useRewardsService";
import { useIsMobileView } from "@/app/hooks/useBreakpoint";
import { useBalanceState } from "@/app/state/BalanceState";
import { useRewardsState } from "@/app/state/RewardState";
import { getNetworkConfigBBN } from "@/config/network/bbn";
import { getNetworkConfigBTC } from "@/config/network/btc";
import { ubbnToBaby } from "@/utils/bbn";
import { satoshiToBtc } from "@/utils/btc";
import { DataWidget, StatsSection } from "@/app/componentsStakefish/DataWidget";
import { NA_SYMBOL } from "@/ui/utils/constants";

import { ClaimRewardModal } from "../Modals/ClaimRewardModal";
import { ClaimStatusModal } from "../Modals/ClaimStatusModal/ClaimStatusModal";
import { ActionComponent } from "../Stats/ActionComponent";

const { networkName: bbnNetworkName, coinSymbol: bbnCoinSymbol } =
  getNetworkConfigBBN();
const { coinSymbol } = getNetworkConfigBTC();

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
    pendingBtcBalance,
    inscriptionsBtcBalance,
    loading: isBalanceLoading,
  } = useBalanceState();

  const { allUTXOs = [], confirmedUTXOs = [] } = useUTXOs();
  const hasUnconfirmedUTXOs = allUTXOs.length > confirmedUTXOs.length;

  const { claimRewards, showPreview } = useRewardsService();

  const isMobile = useIsMobileView();
  const formattedRewardBalance = ubbnToBaby(rewardBalance);

  const pendingSat = 0;
  const withdrawableSat = 0;

  const sections: StatsSection[] = [
    {
      title: {
        text: "Active stake",
        tooltip: "Your total number of active stakes",
      },
      value: {
        text: pendingBtcBalance
          ? `${`${satoshiToBtc(pendingBtcBalance)} ${coinSymbol}`}`
          : NA_SYMBOL,
        isLoading: isBalanceLoading,
      },
      className: "col-span-1 flounder:col-span-2 flex-col",
    },
    {
      // TODO: not sure what to render here, pending on withdrawable or maybe both and remove stakable balance
      title: { text: "Pending Stake" },
      value: {
        text: pendingSat
          ? `${`${satoshiToBtc(pendingSat)} ${coinSymbol}`}`
          : NA_SYMBOL,
        isLoading: isBalanceLoading,
      },
      className: "flex-col whaleShark:flex-row",
    },
    {
      title: {
        text: `${isMobile ? "BABY" : bbnNetworkName} Balance`,
      },
      value: {
        text: bbnBalance
          ? `${ubbnToBaby(bbnBalance)} ${bbnCoinSymbol}`
          : NA_SYMBOL,
        isLoading: isBalanceLoading,
      },
      className: "flex-col whaleShark:flex-row",
    },
    {
      title: {
        text: "Stakable Balance",
        tooltip: inscriptionsBtcBalance
          ? `You have ${satoshiToBtc(inscriptionsBtcBalance)} ${coinSymbol} that contains inscriptions. To use this in your stakable balance unlock them within the menu.`
          : "Stakable balance only includes confirmed Bitcoin balance of your wallet. It does not include balance stemming from pending transactions.",
      },
      value: {
        text: stakableBtcBalance
          ? `${satoshiToBtc(stakableBtcBalance).toFixed(8)} ${coinSymbol}`
          : NA_SYMBOL,
        isLoading: isBalanceLoading,
      },
      className: "flex-col whaleShark:flex-row",
    },
    {
      title: { text: `${isMobile ? "BABY" : bbnNetworkName} Rewards` },
      value: {
        text: `${
          formattedRewardBalance
            ? `${formattedRewardBalance} ${bbnCoinSymbol}`
            : NA_SYMBOL
        }`,
        isLoading: rewardLoading,
      },
      className: "flex-col whaleShark:flex-row",
      // TODO: style modal
      button: formattedRewardBalance ? (
        <ActionComponent
          className="h-6"
          title="Claim"
          onAction={showPreview}
          isDisabled={!rewardBalance || processing}
        />
      ) : undefined,
    },
  ];

  return (
    <div>
      <DataWidget label="Your staking" sections={sections} />

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
    </div>
  );
}
