import { ListItem, Loader, type ListItemProps } from "@babylonlabs-io/core-ui";
import { useEffect, useState, type JSX } from "react";

import { useIsMobileView } from "@/ui/hooks/useBreakpoint";

interface StatItemProps extends ListItemProps {
  hidden?: boolean;
  loading?: boolean;
  tooltip?: string | JSX.Element;
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
  loadingStyle = LoadingStyle.ShowSpinner,
  ...props
}: StatItemProps) => {
  const isMobileView = useIsMobileView();
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    if (!isMobileView && dialogOpen) {
      setDialogOpen(false);
    }
  }, [isMobileView, dialogOpen]);

  if (hidden) return null;

  return (
    <ListItem
      {...props}
      title={title}
      value={loading ? SPINNER_RENDERERS[loadingStyle](value) : value}
    />
  );
};
