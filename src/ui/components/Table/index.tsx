import type { HTMLAttributes } from "react";

import { cx } from "../../utils";
import { Icon } from "../Icon";

import type { ColProps, HeaderColProps, HeaderProps, RowProps } from "./types";

export const Container = ({
  children,
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) => (
  <div className={cx("app-table", className)} {...props}>
    {children}
  </div>
);

export const ScrollWrapper = ({
  children,
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) => (
  <div className={cx("overflow-auto", className)} {...props}>
    {children}
  </div>
);

export const Row = ({
  children,
  className,
  highlight,
  disabled,
  expandCell,
  id,
  ...props
}: RowProps) => {
  return (
    <div
      id={id}
      className={cx(
        "app-table-row group",
        highlight &&
          "bg-backgroundPrimaryHighlight text-backgroundPrimaryOnHighlight",
        disabled && "text-itemSecondaryDefault",
        expandCell && "[&>*]:flex-grow",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export const Col = ({
  children,
  className,
  align = "start",
  expandCell = false,
  ...props
}: ColProps) => {
  return (
    <div
      className={cx(
        "app-table-col",
        align === "end" && "text-end justify-end",
        align === "center" && "text-center justify-center",
        expandCell && "tuna:flex-grow tuna:!max-w-[initial]",
        className,
      )}
      {...props}
    >
      <div className="w-full">{children}</div>
    </div>
  );
};

export const HeaderCol = ({
  className,
  direction,
  sortKey,
  onSortClick,
  children,
  align = "start",
  expandCell = false,
  ...props
}: HeaderColProps) => {
  const isSortingEnabled = Boolean(sortKey);
  const isSortingActivated = isSortingEnabled && Boolean(direction);

  return (
    <div
      onClick={
        isSortingEnabled && onSortClick
          ? () => onSortClick(sortKey as string)
          : undefined
      }
      role="button"
      tabIndex={0}
      className={cx(
        "app-table-header-col",
        align === "end" && "text-end justify-end",
        align === "center" && "text-center justify-center",
        expandCell && "tuna:flex-grow tuna:!max-w-[initial]",
        isSortingEnabled && "app-table-sort",
        isSortingActivated && "app-table-sort-active",
        className,
      )}
      {...props}
    >
      {children}

      {isSortingEnabled && (
        <div
          className={cx(
            "flex ml-2 relative top-0",
            direction === undefined ? "rotate-90" : "",
          )}
        >
          <Icon
            iconKey={
              direction === "asc"
                ? "chevronUp"
                : direction === "desc"
                  ? "chevronDown"
                  : "chevronSelector"
            }
            size={14}
          />
        </div>
      )}
    </div>
  );
};
export const Header = ({
  className,
  children,
  rowProps,
  sticky,
  ...props
}: HeaderProps) => {
  const {
    expandCell,
    className: rowClassName,
    ...restRowProps
  } = rowProps || {};

  return (
    <div
      id="TableHeader"
      className={cx(
        "app-table-header",
        sticky && "sticky top-0 z-table",
        className,
      )}
      {...props}
    >
      <div
        className={cx(
          "app-table-header-row group",
          expandCell && "[&>*]:flex-grow",
          rowClassName,
        )}
        {...restRowProps}
      >
        {children}
      </div>
    </div>
  );
};
