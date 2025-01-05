import { Heading } from "@babylonlabs-io/bbn-core-ui";

import {
  ActionType,
  useDelegationService,
} from "@/app/hooks/services/useDelegationService";
import { type DelegationV2 } from "@/app/types/delegationsV2";
import { GridTable, type TableColumn } from "@/components/common/GridTable";
import { FinalityProviderMoniker } from "@/components/delegations/DelegationList/components/FinalityProviderMoniker";
import { getNetworkConfigBBN } from "@/config/network/bbn";

import { ActionButton } from "./components/ActionButton";
import { Amount } from "./components/Amount";
import { DelegationModal } from "./components/DelegationModal";
import { Inception } from "./components/Inception";
import { Status } from "./components/Status";
import { TxHash } from "./components/TxHash";

type TableParams = {
  validations: Record<string, { valid: boolean; error?: string }>;
  handleActionClick: (action: ActionType, delegation: DelegationV2) => void;
};

const { networkFullName: bbnNetworkFullName } = getNetworkConfigBBN();

const columns: TableColumn<DelegationV2, TableParams>[] = [
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
    renderCell: (row) => <Status delegation={row} />,
  },
  {
    field: "actions",
    headerName: "Action",
    renderCell: (row, _, { handleActionClick, validations }) => {
      const { valid, error } = validations[row.stakingTxHashHex];

      return (
        <ActionButton
          disabled={!valid}
          tooltip={error}
          delegation={row}
          state={row.state}
          onClick={handleActionClick}
        />
      );
    },
  },
];

export function DelegationList() {
  const {
    processing,
    confirmationModal,
    delegations,
    isLoading,
    hasMoreDelegations,
    validations,
    fetchMoreDelegations,
    executeDelegationAction,
    openConfirmationModal,
    closeConfirmationModal,
  } = useDelegationService();

  return (
    <div className="bg-secondary-contrast p-6 border border-primary-dark/20">
      <Heading variant="h6" className="text-primary-light py-2 mb-6">
        {bbnNetworkFullName} Stakes
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
        params={{ handleActionClick: openConfirmationModal, validations }}
        fallback={<div>No delegations found</div>}
      />

      <DelegationModal
        action={confirmationModal?.action}
        delegation={confirmationModal?.delegation ?? null}
        processing={processing}
        onSubmit={executeDelegationAction}
        onClose={closeConfirmationModal}
      />
    </div>
  );
}
