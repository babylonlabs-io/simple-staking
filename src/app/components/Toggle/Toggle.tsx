import { twJoin } from "tailwind-merge";

interface ToggleProps {
  defaultChecked?: boolean;
  disabled?: boolean;
  onChange: () => void;
}

export const Toggle: React.FC<ToggleProps> = ({
  defaultChecked = false,
  disabled = false,
  onChange,
}) => {
  return (
    <input
      type="checkbox"
      defaultChecked={defaultChecked}
      disabled={disabled}
      onClick={onChange}
      className={twJoin(
        "appearance-none relative w-11 h-6 p-[6px] rounded-[100px] transition-all duration-300 outline-none cursor-pointer",
        "bg-secondary-contrast border border-primary-light/20",
        "checked:bg-primary-light checked:border-primary-light",

        // Toggle circle
        "after:content-[''] after:absolute after:top-1/2 after:w-4 after:h-4",
        "after:rounded-full after:bg-primary-light after:-translate-y-1/2",
        "after:transition-all after:duration-300 after:left-[4px]",
        "checked:after:translate-x-[18px] checked:after:bg-secondary-contrast",

        // Lock icon (shown when unchecked)
        "before:content-[''] before:absolute before:top-1/2 before:w-4 before:h-4",
        "before:bg-cover before:-translate-y-1/2 before:left-1/2",
        "before:opacity-100 before:transition-opacity before:duration-300",
        "before:bg-[url('/lock.svg')]",
        "checked:before:opacity-0",

        // Disabled state
        "disabled:cursor-not-allowed disabled:opacity-50",
      )}
    />
  );
};
