import { useId } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import { twJoin, twMerge } from "tailwind-merge";

import { LoadingTableList } from "@/app/components/Loading/Loading";

import { GridCell } from "./components/TCell";
import { GridHead } from "./components/THead";
import type { TableColumn, TableProps } from "./types";
import { createColumnTemplate } from "./utils";

export function GridTable<R extends object, P extends object = {}>({
  loading = false,
  infiniteScroll = false,
  classNames,
  columns,
  sortColumn,
  fallback,
  params = {} as P,
  data = [],
  getRowId,
  onRowClick,
  onCellClick,
  onInfiniteScroll = () => null,
  onSortColumn = () => null,
}: TableProps<R, P>) {
  const id = useId();

  function handleCellClick(row: R, col: TableColumn<R, P>) {
    return () => {
      onRowClick?.(row);
      onCellClick?.(row, col);
    };
  }

  if (!data?.length) {
    return fallback;
  }

  return (
    <div
      id={id}
      className={twMerge(
        "no-scrollbar overflow-y-auto",
        classNames?.wrapperClassName,
      )}
    >
      <InfiniteScroll
        className={twMerge("grid", classNames?.bodyClassName)}
        style={{
          gridTemplateColumns: createColumnTemplate(columns),
          overflow: "visible",
        }}
        dataLength={data.length}
        next={onInfiniteScroll}
        hasMore={infiniteScroll}
        loader={loading ? <LoadingTableList /> : null}
        scrollableTarget={id}
      >
        <div className={twMerge("contents", classNames?.headerRowClassName)}>
          {columns.map((col) => (
            <GridHead
              key={col.field}
              sortable={col.sortable}
              field={col.field}
              className={twMerge(
                "sticky top-0 bg-surface",
                classNames?.headerCellClassName,
                col.headerCellClassName,
              )}
              title={col.headerName}
              align={col.align}
              sortColumn={sortColumn}
              onSortChange={onSortColumn}
            />
          ))}
        </div>

        {data.map((row, i) => {
          const rowId = getRowId(row);

          return (
            <div
              key={getRowId(row)}
              className={twJoin(
                "contents",
                typeof classNames?.rowClassName === "string"
                  ? classNames?.rowClassName
                  : classNames?.rowClassName?.(row, params),
              )}
            >
              {columns.map((col) => (
                <GridCell
                  key={`${rowId}-${col.field}`}
                  className={twMerge(
                    typeof classNames?.cellClassName === "string"
                      ? classNames?.cellClassName
                      : classNames?.cellClassName?.(row, col, params),
                    col.cellClassName,
                  )}
                  align={col.align}
                  onClick={() => handleCellClick(row, col)}
                >
                  {col.renderCell?.(row, i, params) ??
                    (row[col.field as keyof R] as string)}
                </GridCell>
              ))}
            </div>
          );
        })}
      </InfiniteScroll>
    </div>
  );
}

export * from "./types";
