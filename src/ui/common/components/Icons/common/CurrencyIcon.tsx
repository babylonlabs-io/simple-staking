import { BaseIconProps } from "../index";
import { ThemedIcon } from "../ThemedIcon";

export const CurrencyIcon = ({ className = "", size = 24 }: BaseIconProps) => {
  return (
    <ThemedIcon variant="primary" background rounded className={className}>
      <svg
        style={{ width: size, height: size * 0.727 }}
        viewBox="0 0 22 16"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M22 3V16H3V14H20V3H22ZM18 12H0V0H18V12ZM12 6C12 4.34 10.66 3 9 3C7.34 3 6 4.34 6 6C6 7.66 7.34 9 9 9C10.66 9 12 7.66 12 6Z" />
      </svg>
    </ThemedIcon>
  );
};
