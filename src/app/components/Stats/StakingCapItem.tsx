import { memo } from "react";

import { useAppState, type AppState } from "@/app/state";
import { getNetworkConfig } from "@/config/network.config";
import { satoshiToBtc } from "@/utils/btcConversions";
import { maxDecimals } from "@/utils/maxDecimals";

import { StatItem } from "./StatItem";
import { stakingTvlCap } from "./icons";

const { coinName } = getNetworkConfig();

type StakingCapAdapter = {
  match: (state: AppState) => boolean;
  adopt: (state: AppState) => JSX.Element | undefined;
};

const STAKING_CAP_ITEMS: StakingCapAdapter[] = [
  {
    match: ({ isLoading, currentHeight, currentVersion }) =>
      !currentHeight || !currentVersion || isLoading,
    adopt: ({ isLoading }) => (
      <StatItem
        loading={isLoading}
        icon={stakingTvlCap}
        title="Staking TVL Cap"
        value="-"
      />
    ),
  },

  {
    match: ({ isApprochingNextVersion, nextVersion }) =>
      isApprochingNextVersion && Boolean(nextVersion?.activationHeight),
    adopt: ({
      nextVersion: { activationHeight = 0 } = {},
      currentHeight = 0,
    }) => {
      const remainingBlocks = activationHeight - currentHeight - 1;

      return (
        <StatItem
          icon={stakingTvlCap}
          title="Staking Window"
          value={`opens in ${remainingBlocks} ${remainingBlocks == 1 ? "block" : "blocks"}`}
        />
      );
    },
  },

  {
    match: ({ isApprochingNextVersion, nextVersion }) =>
      isApprochingNextVersion && Boolean(nextVersion?.stakingCapSat),
    adopt: ({ nextVersion: { stakingCapSat = 0 } = {} }) => (
      <StatItem
        icon={stakingTvlCap}
        title="Next Staking TVL Cap"
        value={`${maxDecimals(satoshiToBtc(stakingCapSat), 8)} ${coinName}`}
      />
    ),
  },

  {
    match: ({ currentVersion }) => Boolean(currentVersion?.stakingCapHeight),
    adopt: ({
      currentVersion: { stakingCapHeight = 0 } = {},
      currentHeight = 0,
    }) => {
      const numOfBlockLeft = stakingCapHeight - currentHeight;

      return (
        <StatItem
          icon={stakingTvlCap}
          title="Staking Window"
          value={
            numOfBlockLeft > 0
              ? `closes in ${numOfBlockLeft} ${numOfBlockLeft == 1 ? "block" : "blocks"}`
              : "closed"
          }
        />
      );
    },
  },

  {
    match: ({ currentVersion }) => Boolean(currentVersion?.stakingCapSat),
    adopt: ({ currentVersion: { stakingCapSat = 0 } = {} }) => (
      <StatItem
        icon={stakingTvlCap}
        title="Staking TVL Cap"
        value={`${maxDecimals(satoshiToBtc(stakingCapSat), 8)} ${coinName}`}
      />
    ),
  },

  {
    match: () => true,
    adopt: () => (
      <StatItem icon={stakingTvlCap} title="Staking TVL Cap" value="-" />
    ),
  },
];

export const StakingCapItem = memo(() => {
  const appState = useAppState();
  const stakingCapAdapter = STAKING_CAP_ITEMS.find(({ match }) =>
    match(appState),
  );

  return stakingCapAdapter?.adopt(appState);
});

StakingCapItem.displayName = "StakingCapItem";
