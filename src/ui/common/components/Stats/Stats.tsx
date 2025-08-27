import { List } from "@babylonlabs-io/core-ui";
import { memo } from "react";

import { Section } from "@/ui/common/components/Section/Section";
import { getNetworkConfigBTC } from "@/ui/common/config/network/btc";
import { usePrice } from "@/ui/common/hooks/client/api/usePrices";
import { useSystemStats } from "@/ui/common/hooks/client/api/useSystemStats";
import { Network } from "@/ui/common/types/network";
import { satoshiToBtc } from "@/ui/common/utils/btc";
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
        />

        <StatItem
          loading={isLoading}
          title="Finality Providers"
          value={`${formatter.format(activeFPs)} Active (${formatter.format(totalFPs)} Total)`}
        />
      </List>
    </Section>
  );
});

Stats.displayName = "Stats";
