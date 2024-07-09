import Image from "next/image";
import { Fragment, useEffect, useState } from "react";
import { AiOutlineInfoCircle } from "react-icons/ai";
import { Tooltip } from "react-tooltip";

import { useGlobalParams } from "@/app/context/api/GlobalParamsProvider";
import {
  StakingStats,
  useStakingStats,
} from "@/app/context/api/StakingStatsProvider";
import { useBtcHeight } from "@/app/context/mempool/BtcHeightProvider";
import { GlobalParamsVersion } from "@/app/types/globalParams";
import { getNetworkConfig } from "@/config/network.config";
import { satoshiToBtc } from "@/utils/btcConversions";
import {
  ParamsWithContext,
  getCurrentGlobalParamsVersion,
} from "@/utils/globalParams";
import { maxDecimals } from "@/utils/maxDecimals";

import confirmedTvl from "./icons/confirmed-tvl.svg";
import delegations from "./icons/delegations.svg";
import pendingStake from "./icons/pending-stake.svg";
import stakers from "./icons/stakers.svg";
import stakingTvlCap from "./icons/staking-tvl-cap.svg";

const buildNextCapText = (
  coinName: string,
  btcHeight: number,
  nextVersion: GlobalParamsVersion,
) => {
  const { stakingCapHeight, stakingCapSat, activationHeight } = nextVersion;
  if (stakingCapHeight) {
    const remainingBlocks = activationHeight - btcHeight - 1;
    return {
      title: "Staking Window",
      value: `opens in ${remainingBlocks} ${remainingBlocks == 1 ? "block" : "blocks"}`,
    };
  } else if (stakingCapSat) {
    return {
      title: "Next Staking TVL Cap",
      value: `${maxDecimals(satoshiToBtc(stakingCapSat), 8)} ${coinName}`,
    };
  }
};

const buildStakingCapSection = (
  coinName: string,
  btcHeight: number,
  paramsCtx: ParamsWithContext,
) => {
  const { currentVersion, nextVersion, isApprochingNextVersion } = paramsCtx;
  if (!currentVersion) {
    return;
  }
  if (isApprochingNextVersion && nextVersion) {
    return buildNextCapText(coinName, btcHeight, nextVersion);
  }
  const { stakingCapHeight, stakingCapSat, confirmationDepth } = currentVersion;
  if (stakingCapHeight) {
    const numOfBlockLeft = stakingCapHeight + confirmationDepth - btcHeight - 1;
    return {
      title: "Staking Window",
      value:
        numOfBlockLeft > 0
          ? `closes in ${numOfBlockLeft} ${numOfBlockLeft == 1 ? "block" : "blocks"}`
          : "closed",
    };
  } else if (stakingCapSat) {
    return {
      title: "Staking TVL Cap",
      value: `${maxDecimals(satoshiToBtc(stakingCapSat), 8)} ${coinName}`,
    };
  }
};

export const Stats: React.FC = () => {
  const [stakingStats, setStakingStats] = useState<StakingStats | undefined>({
    activeTVLSat: 0,
    totalTVLSat: 0,
    activeDelegations: 0,
    totalDelegations: 0,
    totalStakers: 0,
    unconfirmedTVLSat: 0,
  });
  const [stakingCapText, setStakingCapText] = useState<{
    title: string;
    value: string;
  }>({
    title: "Staking TVL Cap",
    value: "-",
  });
  const [isLoading, setIsLoading] = useState(true);
  const stakingStatsProvider = useStakingStats();
  const btcHeight = useBtcHeight();
  const globalParams = useGlobalParams();

  const { coinName } = getNetworkConfig();

  // Load the data from staking stats provider
  useEffect(() => {
    if (stakingStatsProvider.data) {
      setStakingStats(stakingStatsProvider.data);
    }
    setIsLoading(stakingStatsProvider.isLoading || globalParams.isLoading);
  }, [stakingStatsProvider, globalParams]);

  useEffect(() => {
    if (!btcHeight || !globalParams.data) {
      return;
    }
    const paramsWithCtx = getCurrentGlobalParamsVersion(
      btcHeight + 1,
      globalParams.data,
    );
    if (!paramsWithCtx) {
      return;
    }
    const cap = buildStakingCapSection(coinName, btcHeight, paramsWithCtx);
    if (cap) setStakingCapText(cap);
  }, [globalParams, btcHeight, stakingStats, coinName]);

  const formatter = Intl.NumberFormat("en", {
    notation: "compact",
    maximumFractionDigits: 2,
  });

  const sections = [
    [
      {
        title: stakingCapText.title,
        value: stakingCapText.value,
        icon: stakingTvlCap,
      },
      {
        title: "Confirmed TVL",
        value: stakingStats?.activeTVLSat
          ? `${maxDecimals(satoshiToBtc(stakingStats.activeTVLSat), 8)} ${coinName}`
          : 0,
        icon: confirmedTvl,
      },
      {
        title: "Pending Stake",
        value: stakingStats?.unconfirmedTVLSat
          ? `${maxDecimals(satoshiToBtc(stakingStats.unconfirmedTVLSat - stakingStats.activeTVLSat), 8)} ${coinName}`
          : 0,
        icon: pendingStake,
        tooltip:
          stakingStats &&
          stakingStats.unconfirmedTVLSat - stakingStats.activeTVLSat < 0
            ? "Pending TVL can be negative when there are unbonding requests"
            : undefined,
      },
    ],
    [
      {
        title: "Delegations",
        value: stakingStats?.activeDelegations
          ? formatter.format(stakingStats.activeDelegations as number)
          : 0,
        icon: delegations,
        tooltip: "Total number of stake delegations",
      },
      {
        title: "Stakers",
        value: stakingStats?.totalStakers
          ? formatter.format(stakingStats.totalStakers as number)
          : 0,
        icon: stakers,
      },
    ],
  ];

  return (
    <div className="card flex flex-col gap-4 bg-base-300 p-1 shadow-sm lg:flex-row lg:justify-between">
      {sections.map((section, index) => (
        <div
          key={index}
          className="card flex justify-between bg-base-400 p-4 text-sm md:flex-row"
        >
          {section.map((subSection, subIndex) => (
            <Fragment key={subSection.title}>
              <div className="flex items-center gap-2 md:flex-1 md:flex-col lg:flex-initial lg:flex-row flex-wrap justify-center">
                <div className="flex items-center gap-2">
                  <Image src={subSection.icon} alt={subSection.title} />
                  <div className="flex items-center gap-1">
                    <p className="dark:text-neutral-content">
                      {subSection.title}
                    </p>
                    {subSection.tooltip && (
                      <>
                        <span
                          className="cursor-pointer text-xs"
                          data-tooltip-id={`tooltip-${subSection.title}`}
                          data-tooltip-content={subSection.tooltip}
                          data-tooltip-place="top"
                        >
                          <AiOutlineInfoCircle />
                        </span>
                        <Tooltip id={`tooltip-${subSection.title}`} />
                      </>
                    )}
                  </div>
                </div>
                <div>
                  <p className="flex-1 text-right">
                    {isLoading ? (
                      <span className="loading loading-spinner text-primary" />
                    ) : (
                      <strong>{subSection.value}</strong>
                    )}
                  </p>
                </div>
              </div>
              {subIndex !== section.length - 1 && (
                <div className="divider mx-0 my-2 md:divider-horizontal" />
              )}
            </Fragment>
          ))}
        </div>
      ))}
    </div>
  );
};
