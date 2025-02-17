import { List } from "@babylonlabs-io/bbn-core-ui";
import { memo } from "react";

import { Section } from "@/app/components/Section/Section";
import { useSystemStats } from "@/app/hooks/client/api/useSystemStats";
import { getNetworkConfigBTC } from "@/config/network/btc";
import { satoshiToBtc } from "@/utils/btc";
import { maxDecimals } from "@/utils/maxDecimals";

import { StatItem } from "./StatItem";

const { coinName, coinSymbol } = getNetworkConfigBTC();

const formatter = Intl.NumberFormat("en", {
  notation: "compact",
  maximumFractionDigits: 2,
});

export const Stats = memo(() => {
  const { data, isLoading } = useSystemStats();

  const activeTvl = data?.active_tvl ?? 0;
  const activeStakers = data?.active_stakers ?? 0;
  const activeDelegations = data?.active_delegations ?? 0;
  const totalFinalityProviders = data?.total_finality_providers ?? 0;
  const activeFinalityProviders = data?.active_finality_providers ?? 0;

  return (
    <Section
      title="Babylon Bitcoin Staking Stats"
      titleClassName="text-accent-contrast"
    >
      <List orientation="adaptive" className="bg-surface">
        <StatItem
          loading={isLoading}
          title={`Confirmed ${coinSymbol} TVL`}
          value={`${satoshiToBtc(activeTvl) >= 1 ? maxDecimals(satoshiToBtc(activeTvl), 2) : maxDecimals(satoshiToBtc(activeTvl), 8)} ${coinSymbol}`}
          tooltip="Total number of active bitcoins staked"
        />

        <StatItem
          loading={isLoading}
          title="Stakers"
          value={formatter.format(activeStakers)}
          tooltip="Total number of active bitcoin stakers"
        />

        <StatItem
          loading={isLoading}
          title="Delegations"
          value={formatter.format(activeDelegations)}
          tooltip="Total number of active bitcoin staking delegations"
        />

        <StatItem
          loading={isLoading}
          title="Finality Providers"
          value={`${activeFinalityProviders} Active (${totalFinalityProviders} Total)`}
          tooltip="Active and total number of finality providers"
        />
      </List>
    </Section>
  );
});

Stats.displayName = "Stats";
