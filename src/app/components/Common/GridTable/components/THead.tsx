import { useCallback, type ReactNode } from "react";
import { twMerge } from "tailwind-merge";

import type { SortColumn } from "../types";

interface THeadProps {
  field: string;
  title: ReactNode;
  className?: string;
  sortable?: boolean;
  align?: "left" | "right" | "center";
  sortColumn?: SortColumn;
  onSortChange: (sortColumn: SortColumn) => void;
}

const SORT_DIRECTIONS = {
  "": "ASC",
  ASC: "DESC",
  DESC: "",
} as const;

export function GridHead({
  field,
  title,
  className,
  align,
  sortable = false,
  sortColumn,
  onSortChange,
}: THeadProps) {
  const direction = SORT_DIRECTIONS[sortColumn?.direction || ""];

  const handleColumnClick = useCallback(() => {
    if (sortable) {
      onSortChange({ field, direction });
    }
  }, [field, direction, sortable, onSortChange]);

  return (
    <p
      className={twMerge(className, sortable ? "cursor-pointer" : "")}
      style={{ textAlign: align }}
      onClick={handleColumnClick}
    >
      {title}
    </p>
  );
}
