import { Fragment } from "react";
import Image from "next/image";

import { StatsData } from "@/app/api/getStats";
import confirmedTvl from "./icons/confirmed-tvl.svg";
import delegations from "./icons/delegations.svg";
import pendingStake from "./icons/pending-stake.svg";
import stakers from "./icons/stakers.svg";
import stakingTvlCap from "./icons/staking-tvl-cap.svg";

interface StatsProps {
  data: StatsData | undefined;
  isLoading: boolean;
  stakingCap?: number;
}

export const Stats: React.FC<StatsProps> = ({
  data,
  isLoading,
  stakingCap,
}) => {
  const formatter = Intl.NumberFormat("en", {
    notation: "compact",
    maximumFractionDigits: 2,
  });

  const sections = [
    [
      // TODO check field values
      {
        title: "Staking TVL Cap",
        value: stakingCap ? `${+(stakingCap / 1e8).toFixed(6)} Signet BTC` : 0,
        icon: stakingTvlCap,
      },
      {
        title: "Confirmed TVL",
        value: data?.active_tvl
          ? `${+(data.active_tvl / 1e8).toFixed(6)} Signet BTC`
          : 0,
        icon: confirmedTvl,
      },
      {
        title: "Pending Stake",
        value: data?.active_delegations
          ? formatter.format(data.active_delegations as number)
          : 0,
        icon: pendingStake,
      },
    ],
    [
      {
        title: "Delegations",
        value: data?.active_delegations
          ? formatter.format(data.total_delegations as number)
          : 0,
        icon: delegations,
      },
      {
        title: "Stakers",
        value: data?.total_stakers
          ? formatter.format(data.total_stakers as number)
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
                  <p className="dark:text-neutral-content">
                    {subSection.title}
                  </p>
                </div>
                <p className="flex-1 text-right">
                  {isLoading ? (
                    <span className="loading loading-spinner text-primary" />
                  ) : (
                    <strong>{subSection.value}</strong>
                  )}
                </p>
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
