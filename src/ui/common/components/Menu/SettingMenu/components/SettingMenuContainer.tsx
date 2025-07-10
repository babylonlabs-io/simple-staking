import { MobileDialog, Popover } from "@babylonlabs-io/core-ui";
import { twJoin } from "tailwind-merge";

import { useIsMobileView } from "@/ui/common/hooks/useBreakpoint";

interface SettingMenuContainerProps {
  anchorEl: HTMLElement | null;
  children: React.ReactNode;
  className?: string;
  isOpen: boolean;
  onClose: () => void;
}

export const SettingMenuContainer = ({
  anchorEl,
  children,
  className,
  isOpen,
  onClose,
}: SettingMenuContainerProps) => {
  const isMobileView = useIsMobileView();

  const menuContent = (
    <div className="w-full text-primary-main">{children}</div>
  );

  if (isMobileView) {
    return (
      <MobileDialog
        open={isOpen}
        onClose={onClose}
        className="bg-[#FFFFFF] dark:bg-[#252525] text-primary-main p-0"
      >
        {menuContent}
      </MobileDialog>
    );
  }

  return (
    <Popover
      anchorEl={anchorEl}
      open={isOpen}
      offset={[0, 8]}
      placement="bottom-end"
      onClickOutside={onClose}
      className={twJoin(
        "shadow-lg border border-[#38708533] bg-[#FFFFFF] dark:bg-[#252525] dark:border-[#404040] rounded-lg",
        "min-w-[294px]",
        className,
      )}
    >
      {menuContent}
    </Popover>
  );
};
