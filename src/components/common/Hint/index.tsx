import { useId, type PropsWithChildren, type ReactNode } from "react";
import { Tooltip } from "react-tooltip";
import { twJoin } from "tailwind-merge";

import { Icon } from "@/ui";

type HintStatus = "default" | "warning" | "error";

interface HintProps {
  tooltip?: ReactNode;
  status?: HintStatus;
  /** Attach tooltip to children instead of showing separate icon */
  attachToChildren?: boolean;
  wrapperClassName?: string;
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
  attachToChildren = false,
  wrapperClassName,
}: PropsWithChildren<HintProps>) {
  const id = useId();
  const statusColor = STATUS_COLORS[status];

  if (!tooltip) {
    return (
      <div
        className={twJoin(
          "inline-flex items-center gap-1",
          statusColor,
          wrapperClassName,
        )}
      >
        {children}
      </div>
    );
  }

  return (
    <div
      className={twJoin(
        "inline-flex items-center gap-1",
        statusColor,
        wrapperClassName,
      )}
    >
      {attachToChildren ? (
        <span
          className="cursor-pointer"
          data-tooltip-id={id}
          data-tooltip-content={
            typeof tooltip === "string" ? tooltip : undefined
          }
          data-tooltip-place="top"
        >
          {children}
        </span>
      ) : (
        <>
          {children}

          <span
            className={twJoin("cursor-pointer text-xs", statusColor)}
            data-tooltip-id={id}
            data-tooltip-content={
              typeof tooltip === "string" ? tooltip : undefined
            }
            data-tooltip-place="top"
          >
            <Icon
              iconKey="infoCircle"
              size={14}
              className={ICON_COLOR[status]}
            />
          </span>
        </>
      )}

      <Tooltip
        id={id}
        className="tooltip-wrap"
        openOnClick={false}
        clickable={true}
      >
        {typeof tooltip !== "string" && tooltip}
      </Tooltip>
    </div>
  );
}
