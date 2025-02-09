import { MobileDialog, Popover } from "@babylonlabs-io/bbn-core-ui";

import { useIsMobileView } from "@/app/hooks/useBreakpoint";

type MenuContentProps = {
  anchorEl: HTMLElement | null;
  children: React.ReactNode;
  className?: string;
  isOpen: boolean;
  onClose: () => void;
};

export const MenuContent = ({
  anchorEl,
  children,
  className,
  isOpen,
  onClose,
}: MenuContentProps) => {
  const isMobileView = useIsMobileView();

  if (isMobileView) {
    return (
      <MobileDialog open={isOpen} onClose={onClose} className={className}>
        {children}
      </MobileDialog>
    );
  }

  return (
    <Popover
      anchorEl={anchorEl}
      open={isOpen}
      offset={[0, 11]}
      placement="bottom-end"
      onClickOutside={onClose}
      className={`flex flex-col gap-2 bg-surface rounded p-4 border border-secondary-strokeLight ${className}`}
    >
      {children}
    </Popover>
  );
};
