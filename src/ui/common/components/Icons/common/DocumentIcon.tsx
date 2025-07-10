import { ThemedIcon } from "../ThemedIcon";

interface DocumentIconProps {
  size?: number;
  className?: string;
}

export const DocumentIcon = ({ size = 20, className }: DocumentIconProps) => {
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
          d="M4 3C4 2.44772 4.44772 2 5 2H11.5858C11.851 2 12.1054 2.10536 12.2929 2.29289L16.7071 6.70711C16.8946 6.89464 17 7.149 17 7.41421V17C17 17.5523 16.5523 18 16 18H5C4.44772 18 4 17.5523 4 17V3Z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M12 2V6C12 6.55228 12.4477 7 13 7H17"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M7 10H13M7 13H13M7 16H10"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    </ThemedIcon>
  );
};
