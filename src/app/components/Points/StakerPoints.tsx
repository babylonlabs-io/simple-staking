import { useQuery } from "@tanstack/react-query";
import React from "react";

import { getStakersPoints } from "@/app/api/getPoints";

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
    refetchInterval: 60000, // Refresh every minute
    refetchOnWindowFocus: false,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-end gap-1">
        <div className="h-5 w-20 animate-pulse rounded bg-gray-300 dark:bg-gray-700"></div>
      </div>
    );
  }

  const points = stakerPoints?.[0]?.points;

  return (
    <div className="flex items-center justify-end gap-1">
      <p className="whitespace-nowrap font-semibold">
        {points !== undefined ? points : 0}
      </p>
    </div>
  );
};
