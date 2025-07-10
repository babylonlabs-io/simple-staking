import { BaseIconProps } from "../index";
import { ThemedIcon } from "../ThemedIcon";

export const BitcoinPublicKeyIcon = ({
  className = "",
  size = 24,
}: BaseIconProps) => {
  return (
    <ThemedIcon variant="primary" background rounded className={className}>
      <svg
        style={{ width: size, height: size * 0.545 }}
        viewBox="0 0 22 12"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M20 4H11.65C10.83 1.67 8.61 0 6 0C2.69 0 0 2.69 0 6C0 9.31 2.69 12 6 12C8.61 12 10.83 10.33 11.65 8H12L14 10L16 8L18 10L22 5.96L20 4ZM6 9C4.35 9 3 7.65 3 6C3 4.35 4.35 3 6 3C7.65 3 9 4.35 9 6C9 7.65 7.65 9 6 9Z" />
      </svg>
    </ThemedIcon>
  );
};
