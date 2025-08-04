import { twMerge } from "tailwind-merge";

import { SubSectionProps } from "./types";

export const SubSection = ({ children, style, className }: SubSectionProps) => (
  <div
    className={twMerge(
      "flex bg-secondary-highlight text-accent-primary p-4",
      className,
    )}
    style={style}
  >
    {children}
  </div>
);
