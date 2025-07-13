import { List } from "@babylonlabs-io/core-ui";
import { memo, type JSX } from "react";

import { Section } from "@/ui/common/components/Section/Section";
import { getNetworkConfigBTC } from "@/ui/common/config/network/btc";
import { usePrice } from "@/ui/common/hooks/client/api/usePrices";
import { useSystemStats } from "@/ui/common/hooks/client/api/useSystemStats";
import { satoshiToBtc } from "@/ui/common/utils/btc";
import { formatBTCTvl } from "@/ui/common/utils/formatBTCTvl";

import { StatItem } from "./StatItem";

const { coinSymbol } = getNetworkConfigBTC();

const formatter = Intl.NumberFormat("en", {
  notation: "compact",
  maximumFractionDigits: 2,
});

export interface StatItemData {
  title: string;
  value: string | JSX.Element;
  loading?: boolean;
  hidden?: boolean;
  tooltip?: string | JSX.Element;
  suffix?: JSX.Element;
}

export interface StatsProps {
  title?: string;
  items?: StatItemData[];
  className?: string;
}

export const Stats = memo(({ title, items, className }: StatsProps) => {
  const {
    data: {
      total_active_tvl: totalActiveTVL = 0,
      active_tvl: activeTVL = 0,
      btc_staking_apr: stakingAPR,
    } = {},
    isLoading,
  } = useSystemStats();
  const usdRate = usePrice(coinSymbol);

  const defaultItems: StatItemData[] = [
    {
      title: `Total ${coinSymbol} TVL`,
      value: formatBTCTvl(satoshiToBtc(totalActiveTVL), coinSymbol, usdRate),
      loading: isLoading,
    },
    {
      title: `Registered ${coinSymbol} TVL`,
      value: formatBTCTvl(satoshiToBtc(activeTVL), coinSymbol, usdRate),
      loading: isLoading,
    },
    {
      title: `${coinSymbol} Staking APR`,
      value: `${formatter.format(stakingAPR ? stakingAPR * 100 : 0)}%`,
      loading: isLoading,
      hidden: !stakingAPR,
    },
  ];

  const statsItems = items || defaultItems;
  const sectionTitle = title || "Babylon Stats";

  return (
    <Section title={sectionTitle} className={className}>
      <List orientation="adaptive">
        {statsItems.map((item, index) => (
          <StatItem
            key={index}
            loading={item.loading}
            title={item.title}
            value={item.value}
            hidden={item.hidden}
            tooltip={item.tooltip}
            suffix={item.suffix}
          />
        ))}
      </List>
    </Section>
  );
});

Stats.displayName = "Stats";
