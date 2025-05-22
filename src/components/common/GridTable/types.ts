import type { ReactNode } from "react";

export interface TableColumn<R extends object, P extends object = object> {
  field: string;
  headerName: ReactNode;
  cellClassName?: string;
  headerCellClassName?: string;
  width?: string;
  align?: "left" | "right" | "center";
  sortable?: boolean;
  renderCell?: (row: R, index: number, params: P) => ReactNode;
}

export interface SortColumn {
  field: string;
  direction: "ASC" | "DESC" | "";
}

type RowClassNameCreator<R extends object, P extends object> = (
  row: R,
  param: P,
) => string;
type CellClassNameCreator<R extends object, P extends object> = (
  row: R,
  col: TableColumn<R, P>,
  param: P,
) => string;

export interface TableProps<R extends object, P extends object = object> {
  loading?: boolean;
  isFetchingNextPage?: boolean;
  classNames?: {
    wrapperClassName?: string;
    headerCellClassName?: string;
    headerRowClassName?: string;
    rowClassName?: string | RowClassNameCreator<R, P>;
    cellClassName?: string | CellClassNameCreator<R, P>;
    bodyClassName?: string;
    contentClassName?: string;
  };
  sortColumn?: SortColumn;
  infiniteScroll?: boolean;
  columns: TableColumn<R, P>[];
  data: R[];
  params?: P;
  fallback?: ReactNode;
  getRowId: (row: R) => string;
  onRowClick?: (row: R) => void;
  onCellClick?: (row: R, column: TableColumn<R, P>) => void;
  onSortColumn?: (sortColumn: SortColumn) => void;
  onInfiniteScroll?: () => void;
}
