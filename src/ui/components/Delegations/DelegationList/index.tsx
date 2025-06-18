import { Card, Heading } from "@babylonlabs-io/core-ui";

import { GridTable, type TableColumn } from "@/ui/components/Common/GridTable";
import { Hint } from "@/ui/components/Common/Hint";
import { FinalityProviderMoniker } from "@/ui/components/Delegations/DelegationList/components/FinalityProviderMoniker";
import { SignDetailsModal } from "@/ui/components/Modals/SignDetailsModal";
import { getNetworkConfig } from "@/ui/config/network";
import {
  ActionType,
  useDelegationService,
} from "@/ui/hooks/services/useDelegationService";
import { useStakingManagerService } from "@/ui/hooks/services/useStakingManagerService";
import { useDelegationV2State } from "@/ui/state/DelegationV2State";
import {
  DelegationV2StakingState,
  DelegationWithFP,
} from "@/ui/types/delegationsV2";

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
  isStakingManagerReady: boolean;
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
    renderCell: (
      row,
      _,
      { handleActionClick, validations, isStakingManagerReady },
    ) => {
      const { valid, error } = validations[row.stakingTxHashHex];

      if (!valid) return null;

      const isUnbondDisabled =
        row.state === DelegationV2StakingState.ACTIVE && !isStakingManagerReady;

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
  const { delegationV2StepOptions, setDelegationV2StepOptions } =
    useDelegationV2State();

  const detailsModalTitle =
    (delegationV2StepOptions?.type as string) || "Transaction Details";

  return (
    <Card>
      <Heading variant="h6" className="text-accent-primary py-2 mb-6">
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

      {delegationV2StepOptions && processing && (
        <SignDetailsModal
          open={Boolean(delegationV2StepOptions)}
          // we don't need to close the underlying modal if we close the details modal
          onClose={() => setDelegationV2StepOptions(undefined)}
          details={delegationV2StepOptions}
          title={detailsModalTitle}
        />
      )}
    </Card>
  );
}
