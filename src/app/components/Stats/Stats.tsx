import { Heading } from "@babylonlabs-io/bbn-core-ui";
import { memo } from "react";

import { useSystemStats } from "@/app/hooks/api/useSystemStats";
import { getNetworkConfig } from "@/config/network.config";
import { satoshiToBtc } from "@/utils/btcConversions";
import { maxDecimals } from "@/utils/maxDecimals";

import { StatItem } from "./StatItem";

const { coinName } = getNetworkConfig();

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
      <Heading variant="h5" className="text-primary-contrast md:text-4xl">
        Babylon Stats
      </Heading>
      <div className="flex flex-col justify-between bg-secondary-contrast rounded p-6 text-base md:flex-row">
        <StatItem
          loading={isLoading}
          title="Confirmed TVL"
          value={`${maxDecimals(satoshiToBtc(activeTvl), 8)} ${coinName}`}
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
          title="Finality Providers"
          value={`${activeFinalityProviders}/${totalFinalityProviders}`}
          tooltip="Active and total number of finality providers"
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
          title="Reward Rate"
          value="0 BBN"
          tooltip="Current number of BBN token reward per 24 hrs per one bitcoin staked"
        />

        <div className="divider mx-0 my-2 md:divider-horizontal" />

        <StatItem
          loading={isLoading}
          title="Reward History"
          value="O BBN"
          tooltip="Total number of BBN tokens rewarded to bitcoin stakers"
        />
      </div>
    </div>
  );
});

Stats.displayName = "Stats";
