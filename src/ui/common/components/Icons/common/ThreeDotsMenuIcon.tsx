import { iconColorVariants } from "@babylonlabs-io/core-ui";
import { twJoin } from "tailwind-merge";

interface ThreeDotsMenuIconProps {
  className?: string;
  size?: number;
  /** Same variants supported by other icons */
  variant?: keyof typeof iconColorVariants;
  /** Tailwind className to force a color */
  color?: string;
}

export const ThreeDotsMenuIcon = ({
  className = "",
  size = 20,
  variant = "default",
  color,
}: ThreeDotsMenuIconProps) => {
  const colorClass = color || iconColorVariants[variant];

  return (
    <svg
      style={{ width: size, height: size }}
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={twJoin(
        "transition-opacity duration-200",
        colorClass,
        className,
      )}
    >
      <path
        d="M4.99967 8.33203C4.08301 8.33203 3.33301 9.08203 3.33301 9.9987C3.33301 10.9154 4.08301 11.6654 4.99967 11.6654C5.91634 11.6654 6.66634 10.9154 6.66634 9.9987C6.66634 9.08203 5.91634 8.33203 4.99967 8.33203ZM14.9997 8.33203C14.083 8.33203 13.333 9.08203 13.333 9.9987C13.333 10.9154 14.083 11.6654 14.9997 11.6654C15.9163 11.6654 16.6663 10.9154 16.6663 9.9987C16.6663 9.08203 15.9163 8.33203 14.9997 8.33203ZM9.99967 8.33203C9.08301 8.33203 8.33301 9.08203 8.33301 9.9987C8.33301 10.9154 9.08301 11.6654 9.99967 11.6654C10.9163 11.6654 11.6663 10.9154 11.6663 9.9987C11.6663 9.08203 10.9163 8.33203 9.99967 8.33203Z"
        fill="currentColor"
      />
    </svg>
  );
};
