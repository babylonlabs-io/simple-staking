import { type ListItemProps, ListItem, Loader } from "@babylonlabs-io/core-ui";
import { useId } from "react";
import { AiOutlineInfoCircle } from "react-icons/ai";
import { Tooltip } from "react-tooltip";

interface StatItemProps extends ListItemProps {
  loading?: boolean;
  tooltip?: string;
  loadingStyle?: LoadingStyle;
}

export enum LoadingStyle {
  ShowSpinner = "show-spinner",
  ShowSpinnerAndValue = "show-spinner-and-value",
}
const SPINNER_RENDERERS: Record<LoadingStyle, (value: string) => JSX.Element> = {
  [LoadingStyle.ShowSpinner]: () => <Loader size={20} />,
  [LoadingStyle.ShowSpinnerAndValue]: (value: string) => (
        <>
          <span className="opacity-50">{value}</span>
          <Loader size={20} />
        </>
      )
}
export const StatItem = ({
  loading,
  title,
  value,
  tooltip,
  suffix,
  loadingStyle = LoadingStyle.ShowSpinner,
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

  const renderValue = () => {
    if (loading) {
      return SPINNER_RENDERERS[loadingStyle]?.(value);
    }

    return value;
  };

  return (
    <ListItem
      {...props}
      title={title}
      value={renderValue()}
      suffix={suffixEl}
    />
  );
};
