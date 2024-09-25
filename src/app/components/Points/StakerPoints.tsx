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
    refetchInterval: 30000, // refresh every 30 seconds
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

  return (
    <div className="flex items-center justify-end gap-1">
      <p className="whitespace-nowrap font-semibold">
        {points !== undefined ? (
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
