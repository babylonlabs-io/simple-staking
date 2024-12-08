import { twJoin } from "tailwind-merge";

interface ToggleProps {
  disabled?: boolean;
}

export const Toggle: React.FC<ToggleProps> = ({ disabled = false }) => {
  return (
    <input
      type="checkbox"
      disabled={disabled}
      className={twJoin(
        "appearance-none relative w-11 h-6 p-1 rounded-[100px] bg-secondary-contrast border border-primary-light/20 transition outline-none cursor-pointer",
        "after:absolute after:top-1/2 after:w-4 after:h-4 after:rounded-full after:bg-primary-light after:-translate-y-1/2 after:transition checked:after:left-1/2",
        "disabled:before:absolute disabled:before:top-1/2 disabled:before:bg-cover disabled:before:w-4 disabled:before:h-4 disabled:before:-translate-y-1/2 disabled:before:left-1/2 disabled:before:bg-[url('/lock.svg')]",
      )}
    />
  );
};
