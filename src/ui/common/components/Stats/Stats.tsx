import { List } from "@babylonlabs-io/core-ui";
import { memo } from "react";

import { Section } from "@/ui/common/components/Section/Section";
import { getNetworkConfigBTC } from "@/ui/common/config/network/btc";
import { useBsn } from "@/ui/common/hooks/client/api/useBsn";
import { usePrice } from "@/ui/common/hooks/client/api/usePrices";
import { useSystemStats } from "@/ui/common/hooks/client/api/useSystemStats";
import { Network } from "@/ui/common/types/network";
import { satoshiToBtc } from "@/ui/common/utils/btc";
import FeatureFlagService from "@/ui/common/utils/FeatureFlagService";
import { formatBTCTvl } from "@/ui/common/utils/formatBTCTvl";

import { StatItem } from "./StatItem";

const { coinSymbol, network } = getNetworkConfigBTC();

const formatter = Intl.NumberFormat("en", {
  notation: "compact",
  maximumFractionDigits: 2,
});

export const Stats = memo(() => {
  const {
    data: {
      total_active_tvl: totalActiveTVL = 0,
      active_finality_providers: activeFPs = 0,
      total_finality_providers: totalFPs = 0,
      btc_staking_apr: stakingAPR,
    } = {},
    isLoading,
  } = useSystemStats();
  const usdRate = usePrice(coinSymbol);
  const { data: bsns = [], isLoading: isBsnLoading } = useBsn({
    enabled: FeatureFlagService.IsPhase3Enabled,
  });

  return (
    <Section title="Babylon Bitcoin Staking Stats">
      <List orientation="adaptive">
        <StatItem
          loading={isLoading}
          title={`Total ${coinSymbol} TVL`}
          value={formatBTCTvl(
            satoshiToBtc(totalActiveTVL),
            coinSymbol,
            usdRate,
          )}
        />

        <StatItem
          hidden={network === Network.MAINNET ? !stakingAPR : false}
          loading={isLoading}
          title={`${coinSymbol} Staking APR`}
          value={`${formatter.format(network === Network.MAINNET && stakingAPR ? stakingAPR * 100 : 0)}%`}
          tooltip={
            FeatureFlagService.IsPhase3Enabled
              ? "This is the maximum achievable APR based on delegating to the highest-yielding BSNs, including Babylon Genesis. Actual APR may vary depending on your selection."
              : "Annual Percentage Reward (APR) is a dynamic estimate of the annualized staking reward rate based on current network conditions, and it refers to staking rewards rather than traditional lending interest. Rewards are distributed in BABY tokens but shown as a Bitcoin-equivalent rate relative to the Bitcoin initially staked. APR is calculated using U.S. dollar values for Bitcoin and BABY from independent, reputable sources. The APR shown is an approximate figure that can fluctuate, and the displayed value may not always be completely accurate. Actual rewards are not guaranteed and may vary over time. Staking carries exposure to slashing and other risks."
          }
        />

        {FeatureFlagService.IsPhase3Enabled ? (
          <StatItem
            loading={isLoading || isBsnLoading}
            title="BSNs"
            value={`${formatter.format(bsns.length)}`}
          />
        ) : (
          <StatItem
            loading={isLoading}
            title="Finality Providers"
            value={`${formatter.format(activeFPs)} Active (${formatter.format(totalFPs)} Total)`}
          />
        )}
      </List>
    </Section>
  );
});

Stats.displayName = "Stats";
