import { AiOutlineInfoCircle } from "react-icons/ai";
import { Tooltip } from "react-tooltip";

export function FPEmpty() {
  return (
    <div className="flex items-center gap-1 justify-start">
      <span
        className="cursor-pointer text-xs text-error "
        data-tooltip-id="tooltip-missing-fp"
        data-tooltip-content="This finality provider did not provide any information."
        data-tooltip-place="top"
      >
        <AiOutlineInfoCircle size={16} />
      </span>
      <Tooltip id="tooltip-missing-fp" className="tooltip-wrap" />
      <span>No data provided</span>
    </div>
  );
}
