import { BaseIconProps } from "../index";
import { ThemedIcon } from "../ThemedIcon";

export const ThemeIcon = ({ className = "", size = 24 }: BaseIconProps) => {
  return (
    <ThemedIcon variant="primary" background rounded className={className}>
      <svg
        style={{ width: size, height: size }}
        viewBox="0 0 20 20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M10 20C15.52 20 20 15.52 20 10C20 4.48 15.52 0 10 0C4.48 0 0 4.48 0 10C0 15.52 4.48 20 10 20ZM11 2.07C14.94 2.56 18 5.92 18 10C18 14.08 14.95 17.44 11 17.93V2.07Z" />
      </svg>
    </ThemedIcon>
  );
};
