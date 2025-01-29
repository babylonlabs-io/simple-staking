import { Loader } from "@babylonlabs-io/bbn-core-ui";
import { type JSX } from "react";
import { AiOutlineInfoCircle } from "react-icons/ai";
import { Tooltip } from "react-tooltip";

import { ActionComponent } from "./ActionComponent";

interface StatItemProps {
  loading?: boolean;
  icon?: JSX.Element;
  title: string;
  value: string | number;
  tooltip?: string;
  actionComponent?: {
    title: string;
    onAction: () => void;
    isDisabled?: boolean;
  };
}

export const StatItem = ({
  loading,
  icon,
  title,
  value,
  tooltip,
  actionComponent,
}: StatItemProps) => (
  <div className="flex gap-2 justify-between md:flex-col md:items-center lg:flex-row lg:items-center">
    <div className="flex items-center gap-2 md:flex-1 md:flex-col lg:flex-initial lg:flex-row flex-wrap justify-between md:justify-start text-accent-secondary text-base">
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
        <p className="flex-1 text-right text-accent-primary">
          {loading ? <Loader size={20} /> : value}
        </p>
      </div>
    </div>
    {actionComponent ? (
      <ActionComponent
        title={actionComponent.title}
        onAction={actionComponent.onAction}
        isDisabled={actionComponent.isDisabled}
      />
    ) : null}
  </div>
);
