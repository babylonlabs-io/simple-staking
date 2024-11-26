import { type JSX } from "react";
import { AiOutlineInfoCircle } from "react-icons/ai";
import { Tooltip } from "react-tooltip";

interface StatItemProps {
  loading?: boolean;
  icon?: JSX.Element;
  title: string;
  value: string | number;
  tooltip?: string;
}

export const StatItem = ({
  loading,
  icon,
  title,
  value,
  tooltip,
}: StatItemProps) => (
  <div className="flex items-center gap-2 md:flex-1 md:flex-col lg:flex-initial lg:flex-row flex-wrap justify-between text-primary-light text-base">
    <div className="flex items-center gap-2">
      {icon}
      <div className="flex items-center gap-1">
        <p className="dark:text-neutral-content">{title}</p>
        {tooltip && (
          <>
            <span
              className="cursor-pointer text-xs"
              data-tooltip-id={`tooltip-${title}`}
              data-tooltip-content={tooltip}
              data-tooltip-place="top"
            >
              <AiOutlineInfoCircle />
            </span>
            <Tooltip id={`tooltip-${title}`} className="tooltip-wrap" />
          </>
        )}
      </div>
    </div>

    <div>
      <p className="flex-1 text-right">
        {loading ? (
          <span className="loading loading-spinner text-primary-dark" />
        ) : (
          <span className="text-primary-dark">{value}</span>
        )}
      </p>
    </div>
  </div>
);
