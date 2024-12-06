import { Heading } from "@babylonlabs-io/bbn-core-ui";

import { useDelegationService } from "@/app/hooks/services/useDelegationService";
import { type DelegationV2 } from "@/app/types/delegationsV2";
import { GridTable, type TableColumn } from "@/components/common/GridTable";
import { FinalityProviderMoniker } from "@/components/delegations/DelegationList/components/FinalityProviderMoniker";

import { ActionButton } from "./components/ActionButton";
import { Amount } from "./components/Amount";
import { Inception } from "./components/Inception";
import { Status } from "./components/Status";
import { TxHash } from "./components/TxHash";

const columns: TableColumn<
  DelegationV2,
  { handleActionClick: (action: string, txHash: string) => void }
>[] = [
  {
    field: "Inception",
    headerName: "Inception",
    width: "max-content",
    renderCell: (row) => <Inception value={row.bbnInceptionTime} />,
  },
  {
    field: "finalityProvider",
    headerName: "Finality Provider",
    width: "max-content",
    renderCell: (row) => (
      <FinalityProviderMoniker value={row.finalityProviderBtcPksHex[0]} />
    ),
  },
  {
    field: "stakingAmount",
    headerName: "Amount",
    width: "max-content",
    renderCell: (row) => <Amount value={row.stakingAmount} />,
  },
  {
    field: "stakingTxHashHex",
    headerName: "Transaction ID",
    renderCell: (row) => <TxHash value={row.stakingTxHashHex} />,
  },
  {
    field: "state",
    headerName: "Status",
    renderCell: (row) => <Status value={row.state} />,
  },
  {
    field: "actions",
    headerName: "Action",
    renderCell: (row, _, { handleActionClick }) => (
      <ActionButton
        txHash={row.stakingTxHashHex}
        state={row.state}
        onClick={(action, txHash) => handleActionClick(action, txHash)}
      />
    ),
  },
];

export function DelegationList() {
  const {
    delegations,
    isLoading,
    hasMoreDelegations,
    fetchMoreDelegations,
    executeDelegationAction,
  } = useDelegationService();

  return (
    <div className="bg-secondary-contrast p-6">
      <Heading variant="h6" className="text-primary-light py-2 mb-6">
        Babylon Chain Stakes (Phase 2)
      </Heading>
      <GridTable
        getRowId={(row) => `${row.stakingTxHashHex}-${row.startHeight}`}
        columns={columns}
        data={delegations}
        loading={isLoading}
        infiniteScroll={hasMoreDelegations}
        onInfiniteScroll={fetchMoreDelegations}
        classNames={{
          headerRowClassName: "text-primary-light text-xs",
          headerCellClassName: "p-4 text-align-left",
          rowClassName: "group",
          wrapperClassName: "max-h-[21rem] overflow-x-auto",
          bodyClassName: "gap-y-4 min-w-[1000px]",
          cellClassName:
            "p-4 first:pl-4 first:rounded-l last:pr-4 last:rounded-r bg-secondary-contrast flex items-center text-sm justify-start group-even:bg-[#F9F9F9] text-primary-dark",
        }}
        params={{ handleActionClick: executeDelegationAction }}
        fallback={<div>No delegations found</div>}
      />
    </div>
  );
}
