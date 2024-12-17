import { AiOutlineInfoCircle } from "react-icons/ai";
import { Tooltip } from "react-tooltip";

interface DelegationStatusProps {
  state: string;
  tooltip: string;
  stakingTxHashHex: string;
}

export const DelegationStatus: React.FC<DelegationStatusProps> = ({
  state,
  tooltip,
  stakingTxHashHex,
}) => (
  <div className="flex items-center justify-start gap-1">
    <p>{state}</p>
    <span
      className="cursor-pointer text-xs"
      data-tooltip-id={`tooltip-${stakingTxHashHex}`}
      data-tooltip-content={tooltip}
      data-tooltip-place="top"
    >
      <AiOutlineInfoCircle />
    </span>
    <Tooltip id={`tooltip-${stakingTxHashHex}`} className="tooltip-wrap" />
  </div>
);
