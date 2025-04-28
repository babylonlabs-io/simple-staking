import {
  type ListItemProps,
  Button,
  ListItem,
  Loader,
  MobileDialog,
} from "@babylonlabs-io/core-ui";
import { useEffect, useId, useState } from "react";
import { AiOutlineInfoCircle } from "react-icons/ai";
import { Tooltip } from "react-tooltip";

import { useIsMobileView } from "@/app/hooks/useBreakpoint";

interface StatItemProps extends ListItemProps {
  hidden?: boolean;
  loading?: boolean;
  tooltip?: string;
  loadingStyle?: LoadingStyle;
}

export enum LoadingStyle {
  ShowSpinner = "show-spinner",
  ShowSpinnerAndValue = "show-spinner-and-value",
}

const SPINNER_RENDERERS: Record<
  LoadingStyle,
  (value: string | JSX.Element) => JSX.Element
> = {
  [LoadingStyle.ShowSpinner]: () => <Loader size={20} />,
  [LoadingStyle.ShowSpinnerAndValue]: (value) => (
    <>
      <span className="opacity-50">{value}</span>
      <Loader size={20} />
    </>
  ),
};

export const StatItem = ({
  hidden = false,
  loading,
  title,
  value,
  tooltip,
  suffix,
  loadingStyle = LoadingStyle.ShowSpinner,
  ...props
}: StatItemProps) => {
  const tooltipId = useId();
  const isMobileView = useIsMobileView();
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    if (!isMobileView && dialogOpen) {
      setDialogOpen(false);
    }
  }, [isMobileView, dialogOpen]);

  if (hidden) return null;

  const suffixEl =
    !suffix && tooltip ? (
      isMobileView ? (
        <>
          <span
            className="block size-5 cursor-pointer text-xs"
            onClick={() => setDialogOpen(true)}
          >
            <AiOutlineInfoCircle size={20} />
          </span>
          <MobileDialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
            <div className="px-4 py-2 text-accent-primary">{tooltip}</div>
            <div className="p-4">
              <Button
                variant="contained"
                fluid
                onClick={() => setDialogOpen(false)}
              >
                Done
              </Button>
            </div>
          </MobileDialog>
        </>
      ) : (
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
      )
    ) : (
      suffix
    );

  return (
    <ListItem
      {...props}
      title={title}
      value={loading ? SPINNER_RENDERERS[loadingStyle](value) : value}
      suffix={suffixEl}
    />
  );
};
