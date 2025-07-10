import { ThemedIcon } from "../ThemedIcon";

interface ShieldIconProps {
  size?: number;
  className?: string;
}

export const ShieldIcon = ({ size = 20, className }: ShieldIconProps) => {
  return (
    <ThemedIcon variant="primary" background rounded className={className}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 20 20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M10 2L15 4V9C15 13.5 12 17 10 18C8 17 5 13.5 5 9V4L10 2Z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M8 9L9.5 10.5L12.5 7.5"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </ThemedIcon>
  );
};
