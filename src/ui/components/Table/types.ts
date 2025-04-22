import type { HTMLAttributes } from "react";

export type ColProps = HTMLAttributes<HTMLDivElement> & {
  expandCell?: boolean;
  align?: "start" | "end" | "center";
};

export type RowProps = HTMLAttributes<HTMLDivElement> & {
  highlight?: boolean;
  disabled?: boolean;
  id?: string;
  expandCell?: boolean;
};

export type HeaderColProps = HTMLAttributes<HTMLDivElement> &
  ColProps & {
    direction?: "asc" | "desc";
    sortKey?: string;
    onSortClick?: (k: string) => void;
  };

export type HeaderProps = HTMLAttributes<HTMLDivElement> & {
  rowProps?: RowProps;
  sticky?: boolean;
};
