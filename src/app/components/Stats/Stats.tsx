import { Heading } from "@babylonlabs-io/bbn-core-ui";
import { memo } from "react";

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
    <div className="flex flex-col gap-4 p-1 xl:justify-between mb-12">
      <Heading variant="h4" className="text-primary-contrast md:text-4xl">
        Babylon Bitcoin Staking Stats
      </Heading>
      <div className="flex flex-col justify-between bg-secondary-contrast rounded p-6 text-base md:flex-row">
        <StatItem
          loading={isLoading}
          title={`Confirmed ${coinSymbol} TVL`}
          value={`${satoshiToBtc(activeTvl) >= 1 ? maxDecimals(satoshiToBtc(activeTvl), 2) : maxDecimals(satoshiToBtc(activeTvl), 8)} ${coinSymbol}`}
          tooltip="Total number of active bitcoins staked"
        />

        <div className="divider mx-0 my-2 md:divider-horizontal" />

        <StatItem
          loading={isLoading}
          title="Stakers"
          value={formatter.format(activeStakers)}
          tooltip="Total number of active bitcoin stakers"
        />

        <div className="divider mx-0 my-2 md:divider-horizontal" />
        <StatItem
          loading={isLoading}
          title="Delegations"
          value={formatter.format(activeDelegations)}
          tooltip="Total number of active bitcoin staking delegations"
        />

        <div className="divider mx-0 my-2 md:divider-horizontal" />
        <StatItem
          loading={isLoading}
          title="Finality Providers"
          value={`${activeFinalityProviders}/${totalFinalityProviders}`}
          tooltip="Active and total number of finality providers"
        />
      </div>
    </div>
  );
});

Stats.displayName = "Stats";
