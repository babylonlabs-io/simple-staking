import { Card } from "@babylonlabs-io/core-ui";

import {
  ActionType,
  useDelegationService,
} from "@/app/hooks/services/useDelegationService";
import { DelegationWithFP } from "@/app/types/delegationsV2";
import { AuthGuard } from "@/components/common/AuthGuard";
import { GridTable, type TableColumn } from "@/components/common/GridTable";
import { Hint } from "@/components/common/Hint";
import { FinalityProviderMoniker } from "@/components/delegations/DelegationList/components/FinalityProviderMoniker";
import { getNetworkConfig } from "@/config/network";
import { Box } from "@/ui";

import { ActionButton } from "./components/ActionButton";
import { Amount } from "./components/Amount";
import { DelegationModal } from "./components/DelegationModal";
import { Inception } from "./components/Inception";
import { Status } from "./components/Status";
import { TxHash } from "./components/TxHash";
import { DisconectedPrompt } from "./DisconnectedPrompt";
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
    <Card className="p-0">
      <div className="-m-px">
        <Box className="app-table-header-row">
          <div className="app-table-header-col w-full bg-backgroundSecondaryDefault">
            {networkConfig.bbn.networkFullName} Stakes
          </div>
        </Box>

        <GridTable
          getRowId={(row) => `${row.stakingTxHashHex}-${row.startHeight}`}
          columns={columns}
          data={delegations}
          loading={isLoading}
          isFetchingNextPage={isFetchingNextPage}
          infiniteScroll={hasMoreDelegations}
          onInfiniteScroll={fetchMoreDelegations}
          classNames={{
            headerRowClassName: "text-accent-primary app-table-header-row",
            headerCellClassName:
              "text-left app-table-header-col border-b border-b-itemSecondaryDefault",
            rowClassName: "group app-table-row text-itemPrimaryDefault",
            wrapperClassName: "max-h-[25rem] overflow-x-auto",
            bodyClassName: "min-w-[1000px]",
            cellClassName:
              "app-table-col leading-none flex items-center justify-start text-itemPrimaryDefault",
          }}
          params={{
            handleActionClick: openConfirmationModal,
            validations,
          }}
          fallback={
            <AuthGuard fallback={<DisconectedPrompt />}>
              <NoDelegations />
            </AuthGuard>
          }
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
      </div>
    </Card>
  );
}
