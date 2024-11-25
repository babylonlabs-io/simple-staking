import { memo } from "react";

import { useSystemStats } from "@/app/hooks/api/useSystemStats";
import { getNetworkConfig } from "@/config/network.config";
import { satoshiToBtc } from "@/utils/btcConversions";
import { maxDecimals } from "@/utils/maxDecimals";

import { StatItem } from "./StatItem";
import {
  delegationIcon,
  finalityProviderIcon,
  rewardHistoryIcon,
  rewardRateIcon,
  stakerIcon,
  tvlIcon,
} from "./icons";

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
    <div className="card flex flex-col gap-4 bg-base-300 p-1 shadow-sm xl:flex-row xl:justify-between">
      <div className="card flex justify-between bg-base-400 p-4 text-sm md:flex-row">
        <StatItem
          loading={isLoading}
          icon={tvlIcon}
          title="TVL"
          value={`${maxDecimals(satoshiToBtc(activeTvl), 8)} ${coinName}`}
          tooltip="Total number of active bitcoins staked"
        />

        <div className="divider mx-0 my-2 md:divider-horizontal" />

        <StatItem
          loading={isLoading}
          icon={stakerIcon}
          title="Stakers"
          value={formatter.format(activeStakers)}
          tooltip="Total number of active bitcoin stakers"
        />

        <div className="divider mx-0 my-2 md:divider-horizontal" />

        <StatItem
          loading={isLoading}
          icon={finalityProviderIcon}
          title="Finality Providers"
          value={`${activeFinalityProviders}/${totalFinalityProviders}`}
          tooltip="Active and total number of finality providers"
        />
      </div>

      <div className="card flex justify-between bg-base-400 p-4 text-sm md:flex-row">
        <StatItem
          loading={isLoading}
          icon={delegationIcon}
          title="Delegations"
          value={formatter.format(activeDelegations)}
          tooltip="Total number of active bitcoin staking delegations"
        />

        <div className="divider mx-0 my-2 md:divider-horizontal" />

        <StatItem
          loading={isLoading}
          icon={rewardRateIcon}
          title="Reward Rate"
          value="0 BBN"
          tooltip="Current number of BBN token reward per 24 hrs per one bitcoin staked"
        />

        <div className="divider mx-0 my-2 md:divider-horizontal" />

        <StatItem
          loading={isLoading}
          icon={rewardHistoryIcon}
          title="Reward History"
          value="O BBN"
          tooltip="Total number of BBN tokens rewarded to bitcoin stakers"
        />
      </div>
    </div>
  );
});

Stats.displayName = "Stats";
