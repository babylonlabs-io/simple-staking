import { MouseEventHandler, type ReactNode } from "react";
import { twMerge } from "tailwind-merge";

interface TCellProps {
  className?: string;
  align?: "left" | "right" | "center";
  children?: ReactNode;
  onClick?: MouseEventHandler<HTMLTableCellElement>;
}

const ALIGN = {
  left: "justify-start",
  right: "justify-end",
  center: "justify-center",
} as const;

export function GridCell({ className, align, children, onClick }: TCellProps) {
  return (
    <div
      className={twMerge("text-left", className, align && ALIGN[align])}
      onClick={onClick}
    >
      {children}
    </div>
  );
}
