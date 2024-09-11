import React from "react";
import { useMediaQuery } from "usehooks-ts";

import { useDelegationsPoints } from "@/app/context/api/DelegationsPointsProvider";

interface DelegationPointsProps {
  stakingTxHash: string;
}

export const DelegationPoints: React.FC<DelegationPointsProps> = ({
  stakingTxHash,
}) => {
  const { delegationPoints, isLoading } = useDelegationsPoints();
  const isMobile = useMediaQuery("(max-width:1000px)");

  const points = delegationPoints.get(stakingTxHash);

  if (isLoading) {
    return (
      <div className="flex items-center justify-end gap-1">
        <div className="h-5 w-12 animate-pulse rounded bg-gray-300 dark:bg-gray-700"></div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-end gap-1">
      <p className="whitespace-nowrap">
        {isMobile
          ? `Points: ${points !== undefined ? points : 0}`
          : points !== undefined
            ? points
            : 0}
      </p>
    </div>
  );
};
