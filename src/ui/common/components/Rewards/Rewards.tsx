import {
  RewardsPreviewModal,
  RewardsSubsection,
} from "@babylonlabs-io/core-ui";
import { useState } from "react";

import babyTokenIcon from "@/ui/common/assets/baby-token.svg";
import { AuthGuard } from "@/ui/common/components/Common/AuthGuard";
import { Section } from "@/ui/common/components/Section/Section";
import { getNetworkConfigBBN } from "@/ui/common/config/network/bbn";
import { useRewardsService } from "@/ui/common/hooks/services/useRewardsService";
import { useRewardsState } from "@/ui/common/state/RewardState";
import { ubbnToBaby } from "@/ui/common/utils/bbn";

import { ClaimStatusModal } from "../Modals/ClaimStatusModal/ClaimStatusModal";

interface RewardItem {
  amount: string;
  currencyIcon: string;
  chainName: string;
  currencyName: string;
  placeholder: string;
  displayBalance: boolean;
  balanceDetails: {
    balance: string;
    symbol: string;
    price: number;
    displayUSD: boolean;
    decimals: number;
  };
}

/**
 * Generates a circular placeholder icon with a letter in the center as an SVG data URI.
 * Used as a fallback when the BABY token icon is not available for non-BABY tokens.
 *
 * @param letter - The character to display in the center of the circular icon
 * @returns SVG data URI string that can be used as an image source
 */
function generatePlaceholder(letter: string): string {
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='40' height='40'><circle cx='20' cy='20' r='20' fill='%23C4C4C4'/><text x='50%' y='50%' dominant-baseline='central' text-anchor='middle' font-family='Arial, sans-serif' font-size='20' fill='%23ffffff'>${letter}</text></svg>`;
  return `data:image/svg+xml;utf8,${svg}`;
}

export function Rewards() {
  const {
    processing,
    showProcessingModal,
    closeProcessingModal,
    rewardBalance,
    transactionFee,
    transactionHash,
    setTransactionHash,
  } = useRewardsState();

  const { showPreview, claimRewards } = useRewardsService();

  const { networkName: bbnNetworkName, coinSymbol: bbnCoinSymbol } =
    getNetworkConfigBBN();

  // BABY / tBABY reward
  const formattedRewardBaby = rewardBalance
    ? ubbnToBaby(rewardBalance).toString()
    : "0";
  const babyIcon = /BABY$/i.test(bbnCoinSymbol)
    ? babyTokenIcon
    : generatePlaceholder(bbnCoinSymbol.charAt(0));
  const rewards: RewardItem[] = [
    {
      amount: formattedRewardBaby,
      currencyIcon: babyIcon,
      chainName: bbnNetworkName,
      currencyName: bbnCoinSymbol,
      placeholder: "0",
      displayBalance: true,
      balanceDetails: {
        balance: formattedRewardBaby,
        symbol: bbnCoinSymbol,
        price: 0,
        displayUSD: false,
        decimals: 6,
      },
    },
  ];

  const [previewOpen, setPreviewOpen] = useState(false);

  const handleClick = async () => {
    if (!rewardBalance || processing) return;
    await showPreview();
    setPreviewOpen(true);
  };

  const handleProceed = () => {
    claimRewards();
    setPreviewOpen(false);
  };

  const handleClose = () => {
    setPreviewOpen(false);
  };

  const claimDisabled = !rewardBalance || processing;

  return (
    <AuthGuard>
      <Section title="Rewards" titleClassName="md:text-[1.25rem] mt-10">
        <RewardsSubsection
          rewards={rewards}
          disabled={claimDisabled}
          onClick={handleClick}
        />
      </Section>

      <RewardsPreviewModal
        open={previewOpen}
        processing={processing}
        title="Claim Rewards"
        onClose={handleClose}
        onProceed={handleProceed}
        tokens={rewards.map((r) => ({
          name: r.chainName,
          amount: {
            token: `${r.amount} ${r.balanceDetails.symbol}`,
            usd: "",
          },
        }))}
        transactionFees={{
          token: `${ubbnToBaby(transactionFee).toFixed(6)} ${bbnCoinSymbol}`,
          usd: "",
        }}
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
