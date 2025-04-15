"use client";

import { List } from "@babylonlabs-io/core-ui";
import { memo } from "react";

import { Section } from "@/app/components/Section/Section";
import { useLanguage } from "@/app/contexts/LanguageContext";
import { usePrice } from "@/app/hooks/client/api/usePrices";
import { useSystemStats } from "@/app/hooks/client/api/useSystemStats";
import { translations } from "@/app/translations";
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
    } = {},
    isLoading,
  } = useSystemStats();
  const usdRate = usePrice(coinSymbol);
  const { language } = useLanguage();
  const t = translations[language];

  return (
    <Section title={t.stakingStats} titleClassName="text-accent-contrast">
      <List orientation="adaptive" className="bg-surface">
        <StatItem
          loading={isLoading}
          title={t.totalBtcTvl}
          value={formatBTCTvl(
            satoshiToBtc(totalActiveTVL),
            coinSymbol,
            usdRate,
          )}
          tooltip="Total number of active Bitcoins Staked"
        />

        <StatItem
          loading={isLoading}
          title={t.registeredBtcTvl}
          value={formatBTCTvl(satoshiToBtc(activeTVL), coinSymbol, usdRate)}
          tooltip="The total amount of Bitcoin that has been registered in the Babylon Genesis network"
        />

        <StatItem
          loading={isLoading}
          title={t.finalityProviders}
          value={`${formatter.format(activeFPs)} ${t.active} (${formatter.format(totalFPs)} ${t.total})`}
          tooltip="Active and total number of Finality Providers"
        />
      </List>
    </Section>
  );
});

Stats.displayName = "Stats";
