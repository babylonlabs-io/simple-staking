import {
  type ListItemProps,
  ListItem,
  LoadingState,
} from "@babylonlabs-io/core-ui";
import { useId } from "react";
import { AiOutlineInfoCircle } from "react-icons/ai";
import { Tooltip } from "react-tooltip";

interface StatItemProps extends ListItemProps {
  loading?: LoadingState;
  tooltip?: string;
}

export const StatItem = ({
  loading,
  title,
  value,
  tooltip,
  suffix,
  ...props
}: StatItemProps) => {
  const tooltipId = useId();
  const suffixEl =
    !suffix && tooltip ? (
      <>
        <span
          className="block size-5 cursor-pointer text-xs"
          data-tooltip-id={tooltipId}
          data-tooltip-content={tooltip}
          data-tooltip-place="top"
        >
          <AiOutlineInfoCircle size={20} />
        </span>
        <Tooltip id={tooltipId} className="tooltip-wrap" />
      </>
    ) : (
      suffix
    );

  return (
    <ListItem
      {...props}
      title={title}
      value={value}
      suffix={suffixEl}
      loading={loading}
    />
  );
};
