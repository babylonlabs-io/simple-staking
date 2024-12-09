import { Dialog, DialogProps, MobileDialog } from "@babylonlabs-io/bbn-core-ui";

import { useIsMobileView } from "@/app/hooks/useBreakpoint";

export function ResponsiveDialog(props: DialogProps) {
  const isMobileView = useIsMobileView();
  const DialogComponent = isMobileView ? MobileDialog : Dialog;

  return <DialogComponent {...props} />;
}
