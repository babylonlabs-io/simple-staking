import { twJoin } from "tailwind-merge";

interface ToggleProps {
  value: boolean;
  onChange: (value: boolean) => void;
  className?: string;
  disabled?: boolean;
}

export const Toggle = ({
  value,
  onChange,
  className = "",
  disabled = false,
}: ToggleProps) => {
  const handleClick = () => {
    if (!disabled) {
      onChange(!value);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled}
      className={twJoin(
        "relative inline-flex h-[31px] w-[55px] items-center rounded-full transition-colors duration-300 ease-in-out",
        "focus:outline-none focus:ring-2 focus:ring-primary-main focus:ring-offset-2",
        value ? "bg-primary-main dark:bg-primary-light" : "bg-[#78788029]",
        disabled && "opacity-50 cursor-not-allowed",
        className,
      )}
      style={{
        border: "none",
      }}
      aria-pressed={value}
      aria-label="Toggle"
    >
      <span
        className={twJoin(
          "inline-block w-[27px] h-[27px] transform rounded-full bg-white transition-transform duration-300 ease-in-out",
          "flex items-center justify-center shadow-sm",
          value ? "translate-x-[26px]" : "translate-x-[2px]",
        )}
      ></span>
    </button>
  );
};
