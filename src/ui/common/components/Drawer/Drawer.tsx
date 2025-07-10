// To be moved to core-ui

import { twJoin } from "tailwind-merge";

import { ChevronLeftIcon } from "@/ui/common/components/Icons";

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  className?: string;
}

export const Drawer = ({
  isOpen,
  onClose,
  title,
  children,
  className = "",
}: DrawerProps) => {
  return (
    <div
      className={twJoin(
        "absolute inset-0 transform transition-transform duration-300 ease-in-out rounded-lg",
        "bg-[#FFFFFF] dark:bg-[#252525]",
        isOpen ? "translate-x-0" : "translate-x-full",
        className,
      )}
    >
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b border-[#38708533] dark:border-[#404040]">
        <button
          onClick={onClose}
          className="flex items-center justify-center w-8 h-8 rounded hover:bg-accent-secondary/10 transition-colors"
        >
          <ChevronLeftIcon size={16} className="text-accent-primary" />
        </button>
        <h3 className="text-sm font-medium text-accent-primary">{title}</h3>
      </div>

      <div className="flex-1 overflow-y-auto">{children}</div>
    </div>
  );
};
