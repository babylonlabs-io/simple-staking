import React from "react";
import { NumericFormat } from "react-number-format";
import { Tooltip } from "react-tooltip";

interface PointsProps {
  points: number | undefined;
}

export const Points: React.FC<PointsProps> = ({ points }) => {
  if (points === undefined || points === 0) {
    return <>n.a.</>;
  }

  if (points < 0.001 && points > 0) {
    return (
      <>
        <span
          className="cursor-pointer text-xs"
          data-tooltip-id={`tooltip-points-${points}`}
          data-tooltip-content={points.toFixed(8)}
        >
          &lt;0.001
        </span>
        <Tooltip id={`tooltip-points-${points}`} className="tooltip-wrap" />
      </>
    );
  }

  return (
    <NumericFormat
      value={points.toFixed(3)}
      displayType="text"
      thousandSeparator=","
      decimalSeparator="."
    />
  );
};
