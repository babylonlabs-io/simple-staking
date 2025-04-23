import { Card, Heading } from "@babylonlabs-io/core-ui";

import {
  ActionType,
  useDelegationService,
} from "@/app/hooks/services/useDelegationService";
import { DelegationWithFP } from "@/app/types/delegationsV2";
import { GridTable, type TableColumn } from "@/components/common/GridTable";
import { Hint } from "@/components/common/Hint";
import { FinalityProviderMoniker } from "@/components/delegations/DelegationList/components/FinalityProviderMoniker";
import { getNetworkConfig } from "@/config/network";

import { ActionButton } from "./components/ActionButton";
import { Amount } from "./components/Amount";
import { DelegationModal } from "./components/DelegationModal";
import { Inception } from "./components/Inception";
import { Status } from "./components/Status";
import { TxHash } from "./components/TxHash";
import { NoDelegations } from "./NoDelegations";

type TableParams = {
  validations: Record<string, { valid: boolean; error?: string }>;
  handleActionClick: (action: ActionType, delegation: DelegationWithFP) => void;
};

const networkConfig = getNetworkConfig();

const columns: TableColumn<DelegationWithFP, TableParams>[] = [
  {
    field: "Inception",
    headerName: "Inception",
    width: "minmax(max-content, 1fr)",
    renderCell: (row) => <Inception value={row.bbnInceptionTime} />,
  },
  {
    field: "finalityProvider",
    headerName: "Finality Provider",
    width: "minmax(max-content, 1fr)",
    renderCell: (row) => <FinalityProviderMoniker value={row.fp} />,
  },
  {
    field: "stakingAmount",
    headerName: "Amount",
    width: "minmax(max-content, 1fr)",
    renderCell: (row) => <Amount value={row.stakingAmount} />,
  },
  {
    field: "stakingTxHashHex",
    headerName: "Transaction ID",
    width: "minmax(max-content, 1fr)",
    renderCell: (row) => <TxHash value={row.stakingTxHashHex} />,
  },
  {
    field: "state",
    headerName: "Status",
    width: "minmax(max-content, 1fr)",
    renderCell: (row, _, { validations }) => {
      const { valid, error } = validations[row.stakingTxHashHex];
      if (!valid) return <Hint tooltip={error}>Unavailable</Hint>;

      return <Status delegation={row} />;
    },
  },
  {
    field: "actions",
    headerName: "Action",
    width: "minmax(max-content, 0.5fr)",
    renderCell: (row, _, { handleActionClick, validations }) => {
      const { valid, error } = validations[row.stakingTxHashHex];

      // Hide the action button if the delegation is invalid
      if (!valid) return null;

      return (
        <ActionButton
          tooltip={error}
          delegation={row}
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
    isFetchingNextPage,
    hasMoreDelegations,
    validations,
    fetchMoreDelegations,
    executeDelegationAction,
    openConfirmationModal,
    closeConfirmationModal,
  } = useDelegationService();

  return (
    <Card>
      <Heading variant="h5" className="text-accent-primary mb-6">
        {networkConfig.bbn.networkFullName} Stakes
      </Heading>

      <GridTable
        getRowId={(row) => `${row.stakingTxHashHex}-${row.startHeight}`}
        columns={columns}
        data={delegations}
        loading={isLoading}
        isFetchingNextPage={isFetchingNextPage}
        infiniteScroll={hasMoreDelegations}
        onInfiniteScroll={fetchMoreDelegations}
        classNames={{
          headerRowClassName: "text-accent-primary text-xs",
          headerCellClassName: "p-4 text-align-left text-accent-secondary",
          rowClassName: "group",
          wrapperClassName: "max-h-[25rem] overflow-x-auto",
          bodyClassName: "min-w-[1000px]",
          cellClassName:
            "p-4 first:pl-4 first:rounded-l last:pr-4 last:rounded-r bg-surface flex items-center text-sm justify-start group-even:bg-secondary-highlight text-accent-primary",
        }}
        params={{
          handleActionClick: openConfirmationModal,
          validations,
        }}
        fallback={<NoDelegations />}
      />

      <DelegationModal
        action={confirmationModal?.action}
        delegation={confirmationModal?.delegation ?? null}
        param={confirmationModal?.param ?? null}
        processing={processing}
        onSubmit={executeDelegationAction}
        onClose={closeConfirmationModal}
        networkConfig={networkConfig}
      />
    </Card>
  );
}
