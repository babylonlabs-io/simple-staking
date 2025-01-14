import { AiOutlineInfoCircle } from "react-icons/ai";
import { Tooltip } from "react-tooltip";
import { twJoin } from "tailwind-merge";

interface DelegationStatusProps {
  state: string;
  tooltip: string;
  stakingTxHashHex: string;
  isOverflow?: boolean;
}

export const DelegationStatus: React.FC<DelegationStatusProps> = ({
  state,
  tooltip,
  stakingTxHashHex,
  isOverflow,
}) => (
  <div className="flex items-center justify-start gap-1">
    <p className={twJoin(isOverflow ? "text-warning-main" : "")}>{state}</p>
    <span
      className={twJoin(
        "cursor-pointer text-xs",
        isOverflow ? "text-warning-main" : "",
      )}
      data-tooltip-id={`tooltip-${stakingTxHashHex}`}
      data-tooltip-content={tooltip}
      data-tooltip-place="top"
    >
      <AiOutlineInfoCircle />
    </span>
    <Tooltip id={`tooltip-${stakingTxHashHex}`} className="tooltip-wrap" />
  </div>
);
