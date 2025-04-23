import { memo } from "react";

import { DataWidget, StatsSection } from "@/app/componentsStakefish/DataWidget";
import { usePrice } from "@/app/hooks/client/api/usePrices";
import { useSystemStats } from "@/app/hooks/client/api/useSystemStats";
import { getNetworkConfigBTC } from "@/config/network/btc";
import { NA_SYMBOL } from "@/ui/utils/constants";
import { satoshiToBtc } from "@/utils/btc";
import { formatBTCTvl } from "@/utils/formatBTCTvl";
import { useStakingStats } from "@/app/context/api/StakingStatsProvider";
import { useNetworkInfo } from "@/app/hooks/client/api/useNetworkInfo";
import { useStakingState } from "@/app/state/StakingState";

const { coinSymbol } = getNetworkConfigBTC();

export const Stats = memo(() => {
  const {
    data: {
      total_active_tvl: totalActiveTVL = 0,
      active_tvl: activeTVL = 0,
    } = {},
    isLoading: isSystemStatsLoading,
  } = useSystemStats();

  const { data: stakingStats, isLoading: isStakingStatsLoading } =
    useStakingStats();
  const { stakingInfo, loading: isStakingInfoLoading } = useStakingState();
  const usdRate = usePrice(coinSymbol);
  const { data: networkInfo, isLoading: isNetworkInfoLoading } =
    useNetworkInfo();

  const confirmationDepth =
    networkInfo?.params.btcEpochCheckParams?.latestParam
      ?.btcConfirmationDepth || 10;

  const sections: StatsSection[] = [
    {
      title: {
        text: `Total ${coinSymbol} TVL`,
        tooltip: "Total number of active Bitcoins Staked",
      },
      value: {
        text: totalActiveTVL
          ? formatBTCTvl(satoshiToBtc(totalActiveTVL), coinSymbol, usdRate)
          : NA_SYMBOL,
        isLoading: isSystemStatsLoading,
      },
      className: "col-span-1 flex-col flounder:col-span-2",
    },
    {
      title: {
        text: `Confirmed ${coinSymbol} TVL`,
        tooltip:
          "The total amount of Bitcoin that has been registered in the Babylon Genesis network",
      },
      value: {
        text: activeTVL
          ? formatBTCTvl(satoshiToBtc(activeTVL), coinSymbol, usdRate)
          : `0.00000000 ${coinSymbol}`,
        isLoading: isSystemStatsLoading,
      },
      className: "flex-col whaleShark:flex-row",
    },
    {
      title: {
        text: "Pending Stake",
        tooltip: `All stakes start in a Pending state, which denotes that the BTC Staking transaction does not yet have sufficient BTC block confirmations. As soon as it receives ${confirmationDepth} BTC block confirmations, the status transitions to Overflowed or Active. You should unbond and withdraw a stake that is Overflowed.`,
      },
      value: {
        text: stakingStats?.unconfirmedTVLSat
          ? `${satoshiToBtc(stakingStats.unconfirmedTVLSat - stakingStats.activeTVLSat).toFixed(8)} ${coinSymbol}`
          : `0.00000000 ${coinSymbol}`,
        isLoading: isStakingStatsLoading,
      },
      className: "flex-col whaleShark:flex-row",
    },
    {
      title: { text: "Max/Min Staking Period" },
      value: {
        text: `${stakingInfo?.maxStakingTimeBlocks.toLocaleString()}/${stakingInfo?.minStakingTimeBlocks.toLocaleString()} ${coinSymbol} Blocks`,
        isLoading: isStakingInfoLoading,
      },
      className: "flex-col whaleShark:flex-row",
    },
    {
      title: { text: "Annualized Rewards Rate" },
      // TODO: need value here
      value: { text: NA_SYMBOL, isLoading: isNetworkInfoLoading },
      className: "flex-col whaleShark:flex-row",
    },
  ];

  return <DataWidget sections={sections} label="Babylon Bitcoin Staking" />;
});

Stats.displayName = "Stats";
