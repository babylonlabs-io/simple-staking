import { useId } from "react";
import { IoWarningOutline } from "react-icons/io5";
import { Tooltip } from "react-tooltip";

interface WarningTooltipProps {
  className?: string;
}

export const WarningTooltip = ({ className }: WarningTooltipProps) => {
  const id = useId();

  return (
    <span
      className={className}
      data-tooltip-id={id}
      data-tooltip-content="Fees are low, inclusion is not guaranteed"
    >
      <IoWarningOutline
        className="text-warning-main cursor-pointer"
        size={16}
      />
      <Tooltip id={id} className="tooltip-wrap" />
    </span>
  );
};
