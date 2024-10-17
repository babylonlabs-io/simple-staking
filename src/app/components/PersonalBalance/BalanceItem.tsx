import { useId } from "react";
import { AiOutlineInfoCircle } from "react-icons/ai";
import { Tooltip } from "react-tooltip";
import { twMerge } from "tailwind-merge";

interface BalanceItemProps {
  className?: string;
  label: string;
  value: string | JSX.Element;
  tooltip?: string;
}

export function BalanceItem({
  className,
  label,
  value,
  tooltip,
}: BalanceItemProps) {
  const tooltipId = useId();

  return (
    <div
      className={twMerge(
        "flex gap-2 text-sm justify-start sm:items-center",
        className,
      )}
    >
      <div className="flex items-center gap-1 overflow-x-auto whitespace-nowrap">
        <p className="dark:text-neutral-content">{label}:</p>
        {tooltip && (
          <>
            <span
              className="cursor-pointer text-xs"
              data-tooltip-id={tooltipId}
              data-tooltip-content={tooltip}
              data-tooltip-place="bottom"
            >
              <AiOutlineInfoCircle />
            </span>
            <Tooltip id={tooltipId} className="tooltip-wrap" />
          </>
        )}
      </div>
      {typeof value === "string" ? (
        <div className="flex items-center gap-1 overflow-x-auto whitespace-nowrap font-semibold">
          {value}
        </div>
      ) : (
        value
      )}
    </div>
  );
}
