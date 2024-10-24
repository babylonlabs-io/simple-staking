import { useMemo } from "react";
import { twJoin } from "tailwind-merge";

import { Hash } from "@/app/components/Hash/Hash";
import { GridTable, TableColumn } from "@/components/common/GridTable";
import { maxDecimals } from "@/utils/maxDecimals";

import { Delegations } from "./components/Delegations";
import { FPEmpty } from "./components/FPEmpty";
import { FPInfo } from "./components/FPInfo";
import { data as mock } from "./mock";
import type { Props, Row, TableParams } from "./type";

const columns: TableColumn<Row, TableParams>[] = [
  {
    field: "moniker",
    headerName: "Finality Provider",
    renderCell: (row, _, { rowState }) =>
      !rowState[row.btcPk]?.disabled ? (
        <FPInfo moniker={row.moniker} website={row.website} />
      ) : (
        <FPEmpty />
      ),
  },
  {
    field: "btcPk",
    headerName: "BTC PK",
    renderCell: (row) => <Hash value={row.btcPk} address small noFade />,
  },
  {
    field: "stake",
    headerName: "Total Delegation",
    renderCell: (row) => <Delegations totalValue={row.stake} />,
  },
  {
    field: "commission",
    headerName: "Commission",
    renderCell: (row, _, { rowState }) =>
      !rowState[row.btcPk]?.disabled
        ? `${maxDecimals(Number(row.commission) * 100, 2)}%`
        : "-",
  },
];

// Just a workaround for Finality Providers. Ignore it for now.
export function FinalityProviders({
  selectedRow,
  data = mock,
  onRowSelect,
}: Props) {
  const rowState = useMemo(
    () =>
      data.reduce(
        (rowState, row) => ({
          ...rowState,
          [row.btcPk]: {
            selected: row.btcPk === selectedRow,
            disabled: !(row.moniker && row.stake && row.btcPk),
          },
        }),
        {} as TableParams["rowState"],
      ),
    [data, selectedRow],
  );

  return (
    <GridTable
      columns={columns}
      data={data}
      getRowId={(row) => row.btcPk}
      params={{ rowState }}
      classNames={{
        headerRowClassName: "mb-4",
        wrapperClassName: "max-h-[21rem]",
        bodyClassName: "gap-y-4",
        rowClassName: (row, { rowState }) =>
          twJoin(
            "text-sm",
            rowState[row.btcPk]?.disabled
              ? "[&>div]:opacity-50 [&>div]:pointer-events-none"
              : "",
            rowState[row.btcPk]?.selected ? "" : "",
          ),
        cellClassName:
          "py-4 first:pl-4 first:rounded-l-2xl first:border-l last:pr-4 last:rounded-r-2xl last:border-r bg-base-300  border-y dark:bg-base-200 dark:!border-0 flex items-center",
      }}
      onRowClick={(row) => {
        onRowSelect(row.btcPk);
      }}
    />
  );
}
