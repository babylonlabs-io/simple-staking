import { Fragment } from "react";
import Image from "next/image";

import { StatsData } from "@/app/api/getStats";
import tvl from "./tvl.svg";
import delegations from "./delegations.svg";
import stakers from "./stakers.svg";

interface StatsProps {
  data: StatsData | undefined;
  isLoading: boolean;
}

export const Stats: React.FC<StatsProps> = ({ data, isLoading }) => {
  const formatter = Intl.NumberFormat("en", {
    notation: "compact",
    maximumFractionDigits: 2,
  });

  const sections = [
    {
      title: "TVL",
      value: data?.active_tvl ? `${data?.active_tvl / 1e8} Signet BTC` : 0,
      icon: tvl,
    },
    {
      title: "Delegations",
      value: formatter.format(data?.active_delegations as number),
      icon: delegations,
    },
    {
      title: "Stakers",
      value: formatter.format(data?.total_stakers as number),
      icon: stakers,
    },
  ];

  // TODO implement staking part

  return (
    <div className="card flex flex-col gap-2 bg-base-300 p-4 shadow-sm md:flex-row md:justify-between">
      {sections.map((section, index) => (
        <Fragment key={section.title}>
          <div className="flex flex-1 items-center gap-2">
            <div className="flex items-center gap-1">
              <Image src={section.icon} alt={section.title} />
              <p className="dark:text-neutral-content">{section.title}</p>
            </div>
            <p className="flex-1 text-right">
              {isLoading ? (
                <span className="loading loading-spinner text-primary" />
              ) : (
                <strong>{section.value}</strong>
              )}
            </p>
          </div>
          {index !== sections.length - 1 && (
            <div className="divider m-0 md:divider-horizontal" />
          )}
        </Fragment>
      ))}
    </div>
  );
};
