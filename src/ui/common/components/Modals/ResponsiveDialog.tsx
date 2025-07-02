import { Dialog, DialogProps, MobileDialog } from "@babylonlabs-io/core-ui";
import { twMerge } from "tailwind-merge";

import { useIsMobileView } from "@/ui/common/hooks/useBreakpoint";

export function ResponsiveDialog(props: DialogProps) {
  const isMobileView = useIsMobileView();
  const DialogComponent = isMobileView ? MobileDialog : Dialog;

  return (
    <DialogComponent
      {...props}
      className={twMerge("w-[41.25rem] max-w-full", props.className)}
    />
  );
}
