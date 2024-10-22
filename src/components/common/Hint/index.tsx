import { type PropsWithChildren, useId } from "react";
import { AiOutlineInfoCircle } from "react-icons/ai";
import { Tooltip } from "react-tooltip";

interface HintProps {
  tooltip: string;
}

export function Hint({ children, tooltip }: PropsWithChildren<HintProps>) {
  const id = useId();

  return (
    <div className="inline-flex items-center gap-1">
      {children && <p>{children}</p>}
      <span
        className="cursor-pointer text-xs"
        data-tooltip-id={id}
        data-tooltip-content={tooltip}
        data-tooltip-place="top"
      >
        <AiOutlineInfoCircle />
      </span>
      <Tooltip id={id} className="tooltip-wrap" />
    </div>
  );
}
