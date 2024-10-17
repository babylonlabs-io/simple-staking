import React from "react";

import { useDelegationsPoints } from "@/app/context/api/DelegationsPointsProvider";
import { useHealthCheck } from "@/app/hooks/useHealthCheck";
import { shouldDisplayPoints } from "@/config";

import { Points } from "./Points";

interface DelegationPointsProps {
  stakingTxHash: string;
  className?: string;
}

export const DelegationPoints: React.FC<DelegationPointsProps> = ({
  stakingTxHash,
  className,
}) => {
  const { isApiNormal, isGeoBlocked } = useHealthCheck();
  const { delegationPoints, isLoading } = useDelegationsPoints();
  // Early return if the API is not normal or the user is geo-blocked
  if (!isApiNormal || isGeoBlocked || !shouldDisplayPoints()) {
    return null;
  }

  const points = delegationPoints.get(stakingTxHash);
  if (isLoading) {
    return (
      <div className={className}>
        <div className="flex items-center justify-end gap-1">
          <div className="h-5 w-12 animate-pulse rounded bg-gray-300 dark:bg-gray-700"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="flex items-center justify-end gap-1">
        <p className="whitespace-nowrap">
          <span className="lg:hidden">Points: </span>
          <Points points={points} />
        </p>
      </div>
    </div>
  );
};
