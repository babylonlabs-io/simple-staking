import type { TableColumn } from "./types";

export function createColumnTemplate<R extends object, P extends object>(
  columns: TableColumn<R, P>[],
) {
  const hasWidthParam = columns.some((col) => col.width);

  if (hasWidthParam) {
    return columns.reduce((template, col) => {
      const colWidth = col.width ?? "minmax(0, 1fr)";

      return template ? `${template} ${colWidth}` : colWidth;
    }, "");
  }

  return `repeat(${columns.length}, minmax(0, 1fr))`;
}
