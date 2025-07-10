import { ThemeToggle } from "@/ui/common/components/ThemeToggle/ThemeToggle";
interface SettingMenuContentProps {
  className?: string;
}

export const SettingMenuContent = ({ className }: SettingMenuContentProps) => {
  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <div className="flex flex-col gap-1">
        <ThemeToggle />
      </div>
    </div>
  );
};
