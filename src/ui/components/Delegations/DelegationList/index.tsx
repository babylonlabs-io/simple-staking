import { Card, Heading } from "@babylonlabs-io/core-ui";

import { GridTable, type TableColumn } from "@/ui/components/Common/GridTable";
import { Hint } from "@/ui/components/Common/Hint";
import { FinalityProviderMoniker } from "@/ui/components/Delegations/DelegationList/components/FinalityProviderMoniker";
import { getNetworkConfig } from "@/ui/config/network";
import {
  ActionType,
  useDelegationService,
} from "@/ui/hooks/services/useDelegationService";
import { useStakingManagerService } from "@/ui/hooks/services/useStakingManagerService";
import {
  DelegationV2StakingState,
  DelegationWithFP,
} from "@/ui/types/delegationsV2";
import FeatureFlagService from "@/ui/utils/FeatureFlagService";

import { ActionButton } from "./components/ActionButton";
import { Amount } from "./components/Amount";
import { DelegationBsn } from "./components/DelegationBsn";
import { DelegationModal } from "./components/DelegationModal";
import { Inception } from "./components/Inception";
import { Status } from "./components/Status";
import { TxHash } from "./components/TxHash";
import { NoDelegations } from "./NoDelegations";

type TableParams = {
  validations: Record<string, { valid: boolean; error?: string }>;
  handleActionClick: (action: ActionType, delegation: DelegationWithFP) => void;
  isStakingManagerReady: boolean;
};

const networkConfig = getNetworkConfig();

const columnDefinitions = new Map<
  string,
  TableColumn<DelegationWithFP, TableParams>
>([
  [
    "inception",
    {
      field: "Inception",
      headerName: "Inception",
      width: "minmax(max-content, 1fr)",
      renderCell: (row) => <Inception value={row.bbnInceptionTime} />,
    },
  ],
  [
    "finalityProvider",
    {
      field: "finalityProvider",
      headerName: "Finality Provider",
      width: "minmax(max-content, 1fr)",
      renderCell: (row) => <FinalityProviderMoniker value={row.fp} />,
    },
  ],
  [
    "bsn",
    {
      field: "bsn",
      headerName: "BSNs",
      width: "minmax(max-content, 1fr)",
      renderCell: (row) => <DelegationBsn fps={row.fps} onClick={() => {}} />,
    },
  ],
  [
    "stakingAmount",
    {
      field: "stakingAmount",
      headerName: "Amount",
      width: "minmax(max-content, 1fr)",
      renderCell: (row) => <Amount value={row.stakingAmount} />,
    },
  ],
  [
    "stakingTxHashHex",
    {
      field: "stakingTxHashHex",
      headerName: "Transaction ID",
      width: "minmax(max-content, 1fr)",
      renderCell: (row) => <TxHash value={row.stakingTxHashHex} />,
    },
  ],
  [
    "state",
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
  ],
  [
    "actions",
    {
      field: "actions",
      headerName: "Action",
      width: "minmax(max-content, 0.5fr)",
      renderCell: (
        row,
        _,
        { handleActionClick, validations, isStakingManagerReady },
      ) => {
        const { valid, error } = validations[row.stakingTxHashHex];

        if (!valid) return null;

        const isUnbondDisabled =
          row.state === DelegationV2StakingState.ACTIVE &&
          !isStakingManagerReady;

        return (
          <ActionButton
            tooltip={error}
            delegation={row}
            onClick={handleActionClick}
            disabled={isUnbondDisabled}
            showLoader={isUnbondDisabled}
          />
        );
      },
    },
  ],
]);

const defaultColumnOrder = [
  "inception",
  "finalityProvider",
  "stakingAmount",
  "stakingTxHashHex",
  "state",
  "actions",
];

const phase3ColumnOrder = [
  "inception",
  "bsn",
  "stakingAmount",
  "stakingTxHashHex",
  "state",
  "actions",
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

  const { isLoading: isStakingManagerLoading } = useStakingManagerService();
  const isStakingManagerReady = !isStakingManagerLoading;

  const columnOrder = FeatureFlagService.IsPhase3Enabled
    ? phase3ColumnOrder
    : defaultColumnOrder;

  const tableColumns = columnOrder
    .map((key) => columnDefinitions.get(key))
    .filter(Boolean) as TableColumn<DelegationWithFP, TableParams>[];

  return (
    <Card>
      <Heading variant="h6" className="text-accent-primary py-2 mb-6">
        {networkConfig.bbn.networkFullName} Stakes
      </Heading>

      <GridTable
        getRowId={(row) => `${row.stakingTxHashHex}-${row.startHeight}`}
        columns={tableColumns}
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
          isStakingManagerReady,
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
