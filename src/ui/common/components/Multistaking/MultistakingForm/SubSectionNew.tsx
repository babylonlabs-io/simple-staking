import type { CSSProperties, ReactNode } from "react";
import { twJoin } from "tailwind-merge";

export const SubSection = ({
  children,
  style,
  className,
}: {
  children: ReactNode;
  style?: CSSProperties;
  className?: string;
}) => (
  <div
    className={twJoin(
      "flex bg-secondary-highlight text-accent-primary p-4 rounded",
      className,
    )}
    style={style}
  >
    {children}
  </div>
);
