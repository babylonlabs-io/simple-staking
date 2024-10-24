import { useCurrentTime } from "@/hooks/useCurrentTime";
import { durationTillNow } from "@/utils/formatTime";

import { type TableColumn, GridTable } from "../../common/GridTable";

import { ActionButton } from "./components/ActionButton";
import { Amount } from "./components/Amount";
import { Overflow } from "./components/Overflow";
import { Status } from "./components/Status";
import { TxHash } from "./components/TxHash";
import { data } from "./mock";
import type { Delegation, DelegationParams } from "./type";

const columns: TableColumn<Delegation, DelegationParams>[] = [
  {
    field: "stakingValue",
    headerName: "Amount",
    width: "max-content",
    renderCell: (row) => <Amount value={row.stakingValue} />,
  },
  {
    field: "startHeight",
    headerName: "Duration",
    width: "max-content",
    align: "center",
  },
  {
    field: "startTimestamp",
    headerName: "Inception",
    renderCell: (row, _, params) =>
      durationTillNow(row.startTimestamp.toString(), params.currentTime),
  },
  {
    field: "txHash",
    headerName: "Transaction hash",
    cellClassName: "justify-center",
    align: "center",
    renderCell: (row) => <TxHash value={row.txHash} />,
  },
  {
    field: "state",
    headerName: "Status",
    cellClassName: "justify-center",
    align: "center",
    renderCell: (row) => <Status value={row.state} />,
  },
  {
    field: "points",
    headerName: "Points",
    align: "center",
    width: "max-content",
  },
  {
    field: "actions",
    headerName: "Action",
    cellClassName: "justify-center",
    align: "center",
    renderCell: (row) => <ActionButton txHash={row.txHash} state={row.state} />,
  },
  {
    field: "overflow",
    headerName: "",
    width: "max-content",
    cellClassName: "justify-center",
    renderCell: () => <Overflow />,
  },
];

export function DelegationList() {
  const currentTime = useCurrentTime();

  return (
    <GridTable
      getRowId={(row) => `${row.txHash}-${row.startHeight}`}
      columns={columns}
      data={data}
      classNames={{
        headerCellClassName: "py-2 px-4 bg-base-300",
        wrapperClassName: "max-h-[21rem] overflow-x-auto",
        bodyClassName: "gap-y-4 min-w-[1000px]",
        cellClassName:
          "p-4 first:pl-4 first:rounded-l-2xl last:pr-4 last:rounded-r-2xl bg-base-300 border dark:bg-base-200 dark:border-0 flex items-center text-sm",
      }}
      params={{ currentTime }}
    />
  );
}
