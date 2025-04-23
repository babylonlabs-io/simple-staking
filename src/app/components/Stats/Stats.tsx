import { List } from "@babylonlabs-io/core-ui";
import { memo } from "react";

import { Section } from "@/app/components/Section/Section";
import { usePrice } from "@/app/hooks/client/api/usePrices";
import { useSystemStats } from "@/app/hooks/client/api/useSystemStats";
import { getNetworkConfigBTC } from "@/config/network/btc";
import { satoshiToBtc } from "@/utils/btc";
import { formatBTCTvl } from "@/utils/formatBTCTvl";

import { StatItem } from "./StatItem";

const { coinSymbol } = getNetworkConfigBTC();

const formatter = Intl.NumberFormat("en", {
  notation: "compact",
  maximumFractionDigits: 2,
});

export const Stats = memo(() => {
  const {
    data: {
      total_active_tvl: totalActiveTVL = 0,
      active_tvl: activeTVL = 0,
      total_finality_providers: totalFPs = 0,
      active_finality_providers: activeFPs = 0,
      btc_staking_apy: stakingAPY,
    } = {},
    isLoading,
  } = useSystemStats();
  const usdRate = usePrice(coinSymbol);

  return (
    <Section
      title="Babylon Bitcoin Staking Stats"
      titleClassName="text-accent-contrast"
    >
      <List orientation="adaptive" className="bg-surface">
        <StatItem
          loading={isLoading}
          title={`Total ${coinSymbol} TVL`}
          value={formatBTCTvl(
            satoshiToBtc(totalActiveTVL),
            coinSymbol,
            usdRate,
          )}
          tooltip="Total number of active Bitcoins Staked"
        />

        <StatItem
          loading={isLoading}
          title={`Registered ${coinSymbol} TVL`}
          value={formatBTCTvl(satoshiToBtc(activeTVL), coinSymbol, usdRate)}
          tooltip="The total amount of Bitcoin that has been registered in the Babylon Genesis network"
        />

        <StatItem
          hidden={!stakingAPY}
          loading={isLoading}
          title={`${coinSymbol} Staking APY`}
          value={`${formatter.format(stakingAPY ? stakingAPY * 100 : 0)}%`}
          tooltip="The APY is determined with reference to the quantity of BABY reward tokens currently allocated by the Babylon Genesis chain for distribution to BTC stakers, and such quantity being converted to its BTC equivalent using market prices obtained from reputable, independent third-party data sources."
        />

        <StatItem
          loading={isLoading}
          title="Finality Providers"
          value={`${formatter.format(activeFPs)} Active (${formatter.format(totalFPs)} Total)`}
          tooltip="Active and total number of Finality Providers"
        />
      </List>
    </Section>
  );
});

Stats.displayName = "Stats";
