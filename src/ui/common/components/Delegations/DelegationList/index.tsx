import { Card, Heading, Table } from "@babylonlabs-io/core-ui";

import { Hint } from "@/ui/common/components/Common/Hint";
import { FinalityProviderMoniker } from "@/ui/common/components/Delegations/DelegationList/components/FinalityProviderMoniker";
import { getNetworkConfig } from "@/ui/common/config/network";
import {
  ActionType,
  useDelegationService,
} from "@/ui/common/hooks/services/useDelegationService";
import { useStakingManagerService } from "@/ui/common/hooks/services/useStakingManagerService";
import {
  DelegationV2StakingState,
  DelegationWithFP,
} from "@/ui/common/types/delegationsV2";

import { ActionButton } from "./components/ActionButton";
import { Amount } from "./components/Amount";
import { DelegationModal } from "./components/DelegationModal";
import { Inception } from "./components/Inception";
import { Status } from "./components/Status";
import { TxHash } from "./components/TxHash";
import { NoDelegations } from "./NoDelegations";

const networkConfig = getNetworkConfig();

const createColumns = (
  validations: Record<string, { valid: boolean; error?: string }>,
  handleActionClick: (action: ActionType, delegation: DelegationWithFP) => void,
  isStakingManagerReady: boolean,
) => [
  {
    key: "bbnInceptionTime",
    header: "Inception",
    render: (_: unknown, row: DelegationWithFP) => (
      <Inception value={row.bbnInceptionTime} />
    ),
  },
  {
    key: "finalityProvider",
    header: "Finality Provider",
    render: (_: unknown, row: DelegationWithFP) => (
      <FinalityProviderMoniker value={row.fp} />
    ),
  },
  {
    key: "stakingAmount",
    header: "Amount",
    render: (_: unknown, row: DelegationWithFP) => (
      <Amount value={row.stakingAmount} />
    ),
  },
  {
    key: "stakingTxHashHex",
    header: "Transaction ID",
    render: (_: unknown, row: DelegationWithFP) => (
      <TxHash value={row.stakingTxHashHex} />
    ),
  },
  {
    key: "state",
    header: "Status",
    render: (_: unknown, row: DelegationWithFP) => {
      const { valid, error } = validations[row.stakingTxHashHex];
      if (!valid) return <Hint tooltip={error}>Unavailable</Hint>;

      return <Status delegation={row} />;
    },
  },
  {
    key: "actions",
    header: "Action",
    frozen: "right" as const,
    render: (_: unknown, row: DelegationWithFP) => {
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

  const columns = createColumns(
    validations,
    openConfirmationModal,
    isStakingManagerReady,
  );

  // Convert delegations to include an id field for core-ui Table
  const tableData = delegations.map((delegation) => ({
    ...delegation,
    id: `${delegation.stakingTxHashHex}-${delegation.startHeight}`,
  }));

  if (isLoading) {
    return (
      <Card>
        <Heading variant="h6" className="text-accent-primary py-2 mb-6">
          {networkConfig.bbn.networkFullName} Stakes
        </Heading>
        <div className="flex justify-center items-center h-48">
          <div>Loading...</div>
        </div>
      </Card>
    );
  }

  if (!delegations.length && !isLoading) {
    return (
      <Card>
        <Heading variant="h6" className="text-accent-primary py-2 mb-6">
          {networkConfig.bbn.networkFullName} Stakes
        </Heading>
        <NoDelegations />
      </Card>
    );
  }

  return (
    <Card>
      <Heading variant="h6" className="text-accent-primary py-2 mb-6">
        {networkConfig.bbn.networkFullName} Stakes
      </Heading>

      <Table
        wrapperClassName="max-h-[25rem]"
        className="min-w-[1000px]"
        data={tableData}
        columns={columns}
        loading={isFetchingNextPage}
        hasMore={hasMoreDelegations}
        onLoadMore={fetchMoreDelegations}
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
