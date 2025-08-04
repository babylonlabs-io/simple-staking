import {
  RewardsPreviewModal,
  RewardsSubsection,
} from "@babylonlabs-io/core-ui";
import { useState } from "react";

import babyTokenIcon from "@/ui/common/assets/baby-token.svg";
import { AuthGuard } from "@/ui/common/components/Common/AuthGuard";
import { Section } from "@/ui/common/components/Section/Section";
import { getNetworkConfigBBN } from "@/ui/common/config/network/bbn";
import { usePrice } from "@/ui/common/hooks/client/api/usePrices";
import { useRewardsService } from "@/ui/common/hooks/services/useRewardsService";
import { useRewardsState } from "@/ui/common/state/RewardState";
import { ubbnToBaby } from "@/ui/common/utils/bbn";

import { ClaimStatusModal } from "../Modals/ClaimStatusModal/ClaimStatusModal";

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

  const effectiveRewardBalance = rewardBalance;

  const rewards = [] as any[];

  // BABY / tBABY reward
  const formattedRewardBaby = effectiveRewardBalance
    ? ubbnToBaby(effectiveRewardBalance).toString()
    : "0";
  const babyIcon = /BABY$/i.test(bbnCoinSymbol)
    ? babyTokenIcon
    : generatePlaceholder(bbnCoinSymbol.charAt(0));
  const babyPrice = usePrice(bbnCoinSymbol);
  rewards.push({
    amount: formattedRewardBaby,
    currencyIcon: babyIcon,
    chainName: bbnNetworkName,
    currencyName: bbnCoinSymbol,
    placeholder: "0",
    displayBalance: true,
    balanceDetails: {
      balance: formattedRewardBaby,
      symbol: bbnCoinSymbol,
      price: babyPrice,
      displayUSD: true,
      decimals: 6,
    },
  });

  const [previewOpen, setPreviewOpen] = useState(false);

  const handleClick = async () => {
    if (!effectiveRewardBalance || processing) return;
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

  const claimDisabled = !effectiveRewardBalance || processing;

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
        warning="Processing your claim will take approximately 2 blocks to complete. BABY is a test token without any real world value."
        bsns={rewards.map((r) => ({
          icon: <img src={r.currencyIcon} className="size-6" />,
          name: r.currencyName,
        }))}
        amount={{
          token: `${rewards[0].amount} ${bbnCoinSymbol}`,
          usd: `$${(Number(rewards[0].amount) * babyPrice).toFixed(2)}`,
        }}
        transactionFees={{
          token: `${(transactionFee / 1e6).toFixed(6)} ${bbnCoinSymbol}`,
          usd: `$${((transactionFee / 1e6) * babyPrice).toFixed(2)}`,
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
