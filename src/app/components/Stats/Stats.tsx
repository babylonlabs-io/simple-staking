import Image from "next/image";
import React, { Fragment, useEffect, useState } from "react";
import { AiOutlineInfoCircle } from "react-icons/ai";
import { FaLock, FaLockOpen } from "react-icons/fa6";
import { IoCubeSharp } from "react-icons/io5";
import { Tooltip } from "react-tooltip";

import bitcoinWhite from "@/app/assets/bitcoin-white.svg";
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

import { Controls } from "./Controls";

interface StatsProps {
  onStaking: () => void;
  onConnect: () => void;
  address: string;
  totalStakedSat: number;
  totalPendingSat: number;
}

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
      value: `${remainingBlocks} ${remainingBlocks == 1 ? "block" : "blocks"}`,
      icon: FaLock,
    };
  } else if (stakingCapSat) {
    return {
      title: "Next Staking TVL Cap",
      value: `${maxDecimals(satoshiToBtc(stakingCapSat), 8)} ${coinName}`,
      icon: undefined,
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
      value: numOfBlockLeft > 0 ? `${numOfBlockLeft}` : "closed",
      icon: FaLockOpen,
    };
  } else if (stakingCapSat) {
    return {
      title: "Staking TVL Cap",
      value: `${maxDecimals(satoshiToBtc(stakingCapSat), 8)} ${coinName}`,
      icon: undefined,
    };
  }
};

export const Stats: React.FC<StatsProps> = ({
  onConnect,
  onStaking,
  address,
  totalStakedSat,
  totalPendingSat,
}) => {
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
    icon?: any;
    iconAfterText?: any;
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
        icon: stakingCapText.icon,
        iconAfterText: IoCubeSharp,
        tooltipContent: "tooltip-content",
      },
      {
        title: "Confirmed TVL",
        value: stakingStats?.activeTVLSat
          ? `${maxDecimals(satoshiToBtc(stakingStats.activeTVLSat), 2)}`
          : 0,
        icon: bitcoinWhite,
        isIconSvg: true,
      },
      {
        title: "Pending Stake",
        value: totalPendingSat
          ? `${maxDecimals(satoshiToBtc(totalPendingSat), 8)}`
          : 0,
        icon: bitcoinWhite,
        isIconSvg: true,
        tooltip:
          stakingStats &&
          stakingStats.unconfirmedTVLSat - stakingStats.activeTVLSat < 0
            ? "Pending TVL can be negative when there are unbonding requests"
            : undefined,
      },
      {
        title: "YOUR TOTAL STAKE",
        value: totalStakedSat
          ? `${maxDecimals(satoshiToBtc(totalStakedSat), 8)}`
          : 0,
        icon: bitcoinWhite,
        isIconSvg: true,
      },
    ],
  ];

  return (
    <div>
      <div>
        {sections.map((section, index) => (
          <div
            key={index}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4"
          >
            {section.map((subSection, subIndex) => (
              <Fragment key={subSection.title}>
                <div
                  className={`flex items-center justify-center gap-2 md:flex-1 flex-col min-h-[240px] md:px-10 lg:px-12 border border-es-border ${subIndex <= 1 ? "form-bg" : ""}`}
                >
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 justify-center mb-5">
                      <p className="font-bold text-md text-es-text uppercase text-center">
                        {subSection.title}
                      </p>
                      {subSection.tooltipContent ? (
                        <>
                          <span
                            className="cursor-pointer text-xs"
                            data-tooltip-id={`stats-title-${subIndex}`}
                            data-tooltip-content={subSection.tooltipContent}
                            data-tooltip-place="top"
                          >
                            <AiOutlineInfoCircle />
                          </span>
                          <Tooltip id={`stats-title-${subIndex}`} />
                        </>
                      ) : null}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {subSection.icon && !subSection.isIconSvg
                      ? React.createElement(subSection.icon, {
                          className: "text-4xl",
                        })
                      : ""}
                    {subSection.icon && subSection.isIconSvg ? (
                      <Image src={subSection.icon} alt="bitcoin logo white" />
                    ) : (
                      ""
                    )}
                    <p className="flex-1 text-center">
                      {isLoading ? (
                        <span className="loading loading-spinner text-es-accent" />
                      ) : (
                        <strong className="text-3xl text-es-text">
                          {subSection.value}
                        </strong>
                      )}
                    </p>
                    {subSection.iconAfterText
                      ? React.createElement(subSection.iconAfterText, {
                          className: "text-4xl",
                        })
                      : ""}
                  </div>
                </div>
              </Fragment>
            ))}
          </div>
        ))}
      </div>
      <Controls onStaking={onStaking} onConnect={onConnect} address={address} />
    </div>
  );
};
