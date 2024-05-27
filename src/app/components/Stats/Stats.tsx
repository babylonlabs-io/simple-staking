import { Fragment } from "react";
import Image from "next/image";
import { AiOutlineInfoCircle } from "react-icons/ai";
import { Tooltip } from "react-tooltip";

import { StakingStats } from "@/app/types/stakingStats";
import { satoshiToBtc } from "@/utils/btcConversions";
import { maxDecimals } from "@/utils/maxDecimals";
import confirmedTvl from "./icons/confirmed-tvl.svg";
import delegations from "./icons/delegations.svg";
import pendingStake from "./icons/pending-stake.svg";
import stakers from "./icons/stakers.svg";
import stakingTvlCap from "./icons/staking-tvl-cap.svg";
import { getNetworkConfig } from "@/config/network.config";


interface StatsProps {
  stakingStats: StakingStats | undefined;
  isLoading: boolean;
  stakingCapSat?: number;
}

export const Stats: React.FC<StatsProps> = ({
  stakingStats,
  isLoading,
  stakingCapSat,
}) => {
  const formatter = Intl.NumberFormat("en", {
    notation: "compact",
    maximumFractionDigits: 2,
  });

  const { coinName } = getNetworkConfig();

  const sections = [
    [
      {
        title: "Staking TVL Cap",
        value: stakingCapSat
          ? `${maxDecimals(satoshiToBtc(stakingCapSat), 8)} ${coinName}`
          : "-",
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
    <div className="card flex flex-col gap-4 bg-base-300 p-1 shadow-sm 2xl:flex-row 2xl:justify-between">
      {sections.map((section, index) => (
        <div
          key={index}
          className="card flex justify-between bg-base-400 p-4 text-sm md:flex-row"
        >
          {section.map((subSection, subIndex) => (
            <Fragment key={subSection.title}>
              <div className="flex items-center gap-2 md:flex-1 md:flex-col 2xl:flex-initial 2xl:flex-row">
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
