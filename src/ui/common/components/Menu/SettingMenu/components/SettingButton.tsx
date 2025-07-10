import { twJoin } from "tailwind-merge";

interface SettingButtonProps {
  children: React.ReactNode;
  onClick: () => void;
  variant?: "default" | "primary";
  className?: string;
}

export const SettingButton = ({
  children,
  onClick,
  variant = "default",
  className = "",
}: SettingButtonProps) => {
  const variants = {
    default: "text-accent-primary border border-accent-secondary/20",
    primary: "bg-primary-main text-black hover:bg-primary-main/90",
  };

  return (
    <div className="flex justify-center my-6">
      <button
        onClick={onClick}
        className={twJoin(
          "flex items-center justify-center py-4 mx-6 w-full",
          "font-medium text-sm rounded-lg transition-colors cursor-pointer",
          variants[variant],
          className,
        )}
      >
        {children}
      </button>
    </div>
  );
};
