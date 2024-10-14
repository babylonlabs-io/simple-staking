import { memo } from "react";

import { useSystemStats } from "@/app/hooks/api/useSystemStats";
import { getNetworkConfig } from "@/config/network.config";
import { satoshiToBtc } from "@/utils/btcConversions";
import { maxDecimals } from "@/utils/maxDecimals";

import { confirmedTVL, delegations, pendingStake, stakers } from "./icons";
import { StakingCapItem } from "./StakingCapItem";
import { StatItem } from "./StatItem";

const { coinName } = getNetworkConfig();

const formatter = Intl.NumberFormat("en", {
  notation: "compact",
  maximumFractionDigits: 2,
});

export const Stats = memo(() => {
  const {
    data: {
      activeTVLSat = 0,
      unconfirmedTVLSat = 0,
      activeDelegations = 0,
      totalStakers = 0,
    } = {},
    isLoading,
  } = useSystemStats();

  return (
    <div className="card flex flex-col gap-4 bg-base-300 p-1 shadow-sm lg:flex-row lg:justify-between">
      <div className="card flex justify-between bg-base-400 p-4 text-sm md:flex-row">
        <StakingCapItem />

        <div className="divider mx-0 my-2 md:divider-horizontal" />

        <StatItem
          loading={isLoading}
          icon={confirmedTVL}
          title="Confirmed TVL"
          value={`${maxDecimals(satoshiToBtc(activeTVLSat), 8)} ${coinName}`}
        />

        <div className="divider mx-0 my-2 md:divider-horizontal" />

        <StatItem
          loading={isLoading}
          icon={pendingStake}
          title="Pending Stake"
          value={`${maxDecimals(satoshiToBtc(activeTVLSat), 8)} ${coinName}`}
          tooltip={
            unconfirmedTVLSat - activeTVLSat < 0
              ? "Pending TVL can be negative when there are unbonding requests"
              : undefined
          }
        />
      </div>

      <div className="card flex justify-between bg-base-400 p-4 text-sm md:flex-row">
        <StatItem
          loading={isLoading}
          icon={delegations}
          title="Delegations"
          value={formatter.format(activeDelegations)}
          tooltip="Total number of stake delegations"
        />

        <div className="divider mx-0 my-2 md:divider-horizontal" />

        <StatItem
          loading={isLoading}
          icon={stakers}
          title="Stakers"
          value={formatter.format(totalStakers)}
        />
      </div>
    </div>
  );
});

Stats.displayName = "Stats";
