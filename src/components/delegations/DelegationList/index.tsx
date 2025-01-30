import { Card, Heading } from "@babylonlabs-io/bbn-core-ui";
import Link from "next/link";

import { DOCUMENTATION_LINKS } from "@/app/constants";
import {
  ActionType,
  useDelegationService,
} from "@/app/hooks/services/useDelegationService";
import { type DelegationV2 } from "@/app/types/delegationsV2";
import { GridTable, type TableColumn } from "@/components/common/GridTable";
import { FinalityProviderMoniker } from "@/components/delegations/DelegationList/components/FinalityProviderMoniker";
import { getNetworkConfig } from "@/config/network";

import { ActionButton } from "./components/ActionButton";
import { Amount } from "./components/Amount";
import { DelegationModal } from "./components/DelegationModal";
import { Inception } from "./components/Inception";
import { Status } from "./components/Status";
import { TxHash } from "./components/TxHash";

type TableParams = {
  validations: Record<string, { valid: boolean; error?: string }>;
  handleActionClick: (action: ActionType, delegation: DelegationV2) => void;
  slashedStatuses: Record<string, { isSlashed: boolean }>;
};

const networkConfig = getNetworkConfig();

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
    renderCell: (
      row,
      _,
      { handleActionClick, validations, slashedStatuses },
    ) => {
      const { valid, error } = validations[row.stakingTxHashHex];
      const { isSlashed } = slashedStatuses[row.stakingTxHashHex] || {};
      const tooltip = isSlashed ? (
        <>
          <span>
            This finality provider has been slashed.{" "}
            <Link
              className="text-secondary-main"
              target="_blank"
              href={DOCUMENTATION_LINKS.TECHNICAL_PRELIMINARIES}
            >
              Learn more
            </Link>
          </span>
        </>
      ) : (
        error
      );

      return (
        <ActionButton
          disabled={!valid || isSlashed}
          tooltip={tooltip}
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
    slashedStatuses,
  } = useDelegationService();

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
          slashedStatuses,
        }}
        fallback={<div>No delegations found</div>}
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
