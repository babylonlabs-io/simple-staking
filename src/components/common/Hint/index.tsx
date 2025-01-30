import { useId, type PropsWithChildren, type ReactNode } from "react";
import { AiOutlineInfoCircle } from "react-icons/ai";
import { Tooltip } from "react-tooltip";
import { twJoin } from "tailwind-merge";

type HintStatus = "default" | "warning" | "error";

interface HintProps {
  tooltip?: ReactNode;
  status?: HintStatus;
}

const STATUS_COLORS = {
  default: "text-accent-primary",
  warning: "text-warning-main",
  error: "text-error-main",
} as const;

const ICON_COLOR = {
  default: "text-secondary-strokeDark",
  warning: "text-warning-main",
  error: "text-error-main",
} as const;

export function Hint({
  children,
  tooltip,
  status = "default",
}: PropsWithChildren<HintProps>) {
  const id = useId();

  return (
    <div
      className={twJoin(
        "inline-flex items-center gap-1",
        STATUS_COLORS[status],
      )}
    >
      {children && <p>{children}</p>}
      {tooltip && (
        <>
          <span
            className={twJoin("cursor-pointer text-xs")}
            data-tooltip-id={id}
            data-tooltip-content={
              typeof tooltip === "string" ? tooltip : undefined
            }
            data-tooltip-place="top"
          >
            <AiOutlineInfoCircle size={16} className={ICON_COLOR[status]} />
          </span>
          <Tooltip
            id={id}
            className="tooltip-wrap"
            openOnClick={false}
            clickable={true}
          >
            {typeof tooltip !== "string" && tooltip}
          </Tooltip>
        </>
      )}
    </div>
  );
}
