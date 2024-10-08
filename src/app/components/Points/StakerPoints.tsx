import { useQuery } from "@tanstack/react-query";
import React from "react";

import { getStakersPoints } from "@/app/api/getPoints";

import { Points } from "./Points";

interface StakerPointsProps {
  publicKeyNoCoord: string;
}

export const StakerPoints: React.FC<StakerPointsProps> = ({
  publicKeyNoCoord,
}) => {
  const { data: stakerPoints, isLoading } = useQuery({
    queryKey: ["stakerPoints", publicKeyNoCoord],
    queryFn: () => getStakersPoints([publicKeyNoCoord]),
    enabled: !!publicKeyNoCoord,
    refetchInterval: 300000, // Refresh every 5 minutes
    refetchOnWindowFocus: false,
    retry: 1,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-end gap-1">
        <div className="h-5 w-20 animate-pulse rounded bg-gray-300 dark:bg-gray-700"></div>
      </div>
    );
  }

  const points = stakerPoints?.[0]?.points;

  console.log(points !== undefined || points !== 0);

  return (
    <div className="flex items-center justify-end gap-1">
      <p className="whitespace-nowrap font-semibold">
        <Points points={points} />
      </p>
    </div>
  );
};
