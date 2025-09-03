import {
  RewardsPreviewModal,
  RewardsSubsection,
} from "@babylonlabs-io/core-ui";
import { useState } from "react";

import babyTokenIcon from "@/ui/common/assets/baby-token.svg";
import { AuthGuard } from "@/ui/common/components/Common/AuthGuard";
import { Section } from "@/ui/common/components/Section/Section";
import { getNetworkConfigBBN } from "@/ui/common/config/network/bbn";
import { useBbnQuery } from "@/ui/common/hooks/client/rpc/queries/useBbnQuery";
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
  const { rewardCoinsQuery } = useBbnQuery();

  const { networkName: bbnNetworkName, coinSymbol: bbnCoinSymbol } =
    getNetworkConfigBBN();

  // Build rewards list from per-denom rewards; fallback to BABY only if empty
  const formattedRewardBaby = rewardBalance
    ? ubbnToBaby(rewardBalance).toString()
    : "0";
  const babyIcon = /BABY$/i.test(bbnCoinSymbol)
    ? babyTokenIcon
    : generatePlaceholder(bbnCoinSymbol.charAt(0));

  const rewards: RewardItem[] = (() => {
    const coins = rewardCoinsQuery.data ?? [];
    console.log("[RewardsUI] rewardCoinsQuery", {
      loading: rewardCoinsQuery.isLoading,
      error: rewardCoinsQuery.error,
      data: coins,
    });
    if (!coins.length) {
      return [
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
    }

    return coins.map(({ denom, amount }) => {
      console.log("[RewardsUI] processing denom", { denom, amount });
      if (denom === "ubbn") {
        const amt = ubbnToBaby(amount).toString();
        console.log("[RewardsUI] ubbn decoded", { amount, baby: amt });
        return {
          amount: amt,
          currencyIcon: babyIcon,
          chainName: bbnNetworkName,
          currencyName: bbnCoinSymbol,
          placeholder: "0",
          displayBalance: true,
          balanceDetails: {
            balance: amt,
            symbol: bbnCoinSymbol,
            price: 0,
            displayUSD: false,
            decimals: 6,
          },
        } as RewardItem;
      }

      if (denom.startsWith("factory/")) {
        const parts = denom.split("/");
        const subdenom = parts[parts.length - 1] || denom;
        console.log("[RewardsUI] factory token", { denom, subdenom });
        return {
          amount: String(amount),
          currencyIcon: generatePlaceholder(subdenom.charAt(0).toUpperCase()),
          chainName: bbnNetworkName,
          currencyName: subdenom,
          placeholder: "0",
          displayBalance: true,
          balanceDetails: {
            balance: String(amount),
            symbol: subdenom,
            price: 0,
            displayUSD: false,
            decimals: 0,
          },
        } as RewardItem;
      }

      // IBC token: show denom text for now (hash)
      if (denom.startsWith("ibc/")) {
        const symbol = denom; // minimal: show denom text
        console.log("[RewardsUI] ibc token", { denom });
        return {
          amount: String(amount),
          currencyIcon: generatePlaceholder("I"),
          chainName: bbnNetworkName,
          currencyName: symbol,
          placeholder: "0",
          displayBalance: true,
          balanceDetails: {
            balance: String(amount),
            symbol,
            price: 0,
            displayUSD: false,
            decimals: 0,
          },
        } as RewardItem;
      }

      // Fallback: show raw denom
      const symbol = denom;
      console.log("[RewardsUI] unknown denom fallback", { denom });
      return {
        amount: String(amount),
        currencyIcon: generatePlaceholder(symbol.charAt(0).toUpperCase()),
        chainName: bbnNetworkName,
        currencyName: symbol,
        placeholder: "0",
        displayBalance: true,
        balanceDetails: {
          balance: String(amount),
          symbol,
          price: 0,
          displayUSD: false,
          decimals: 0,
        },
      } as RewardItem;
    });
  })();

  const [previewOpen, setPreviewOpen] = useState(false);

  const handleClick = async () => {
    const hasAnyRewards = (rewardCoinsQuery.data?.length ?? 0) > 0;
    if ((!hasAnyRewards && !rewardBalance) || processing) return;
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

  const claimDisabled =
    processing ||
    ((rewardCoinsQuery.data?.length ?? 0) === 0 && !rewardBalance);

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
