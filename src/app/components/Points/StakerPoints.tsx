import { useQuery } from "@tanstack/react-query";
import React from "react";
import { NumericFormat } from "react-number-format";

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
        {points !== undefined && points !== 0 ? (
          <NumericFormat
            value={points.toFixed(3)}
            displayType="text"
            thousandSeparator=","
            decimalSeparator="."
          />
        ) : (
          "n.a."
        )}
      </p>
    </div>
  );
};
