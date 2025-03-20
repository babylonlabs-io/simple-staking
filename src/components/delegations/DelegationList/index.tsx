import { Card, Heading } from "@babylonlabs-io/core-ui";
import Link from "next/link";

import { DOCUMENTATION_LINKS } from "@/app/constants";
import {
  ActionType,
  useDelegationService,
} from "@/app/hooks/services/useDelegationService";
import {
  type DelegationV2,
  DelegationV2StakingState as State,
} from "@/app/types/delegationsV2";
import { FinalityProviderState } from "@/app/types/finalityProviders";
import { GridTable, type TableColumn } from "@/components/common/GridTable";
import { Hint } from "@/components/common/Hint";
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
  handleActionClick: (action: ActionType, delegation: DelegationV2) => void;
  slashedStatuses: Record<string, { isFpSlashed: boolean }>;
};

const networkConfig = getNetworkConfig();

// Mock data for finality providers with different states
const mockFinalityProviders: Record<
  string,
  { description: { moniker: string }; state: FinalityProviderState }
> = {
  // Active finality provider
  "03a34b99f22c790c4e36b2b3c2c35a36db06226e41c692fc82b8b56ac1c540c5b1": {
    description: { moniker: "Active FP" },
    state: FinalityProviderState.ACTIVE,
  },
  // Inactive finality provider
  "04b45c99f22c790c4e36b2b3c2c35a36db06226e41c692fc82b8b56ac1c540c5b2": {
    description: { moniker: "Inactive FP" },
    state: FinalityProviderState.INACTIVE,
  },
  // Jailed finality provider
  "05c56d99f22c790c4e36b2b3c2c35a36db06226e41c692fc82b8b56ac1c540c5b3": {
    description: { moniker: "Jailed FP" },
    state: FinalityProviderState.JAILED,
  },
  // Slashed finality provider
  "06d67e99f22c790c4e36b2b3c2c35a36db06226e41c692fc82b8b56ac1c540c5b4": {
    description: { moniker: "Slashed FP" },
    state: FinalityProviderState.SLASHED,
  },
};

// Create a mock FP state provider that directly uses mockFinalityProviders data
const useMockFinalityProviderState = () => ({
  getFinalityProvider: (btcPkHex: string) =>
    mockFinalityProviders[btcPkHex] || null,
  getFinalityProviderName: (btcPkHex: string) =>
    mockFinalityProviders[btcPkHex]?.description?.moniker || "-",
});

// Custom component for showing FP status in the mock data context
const MockFinalityProviderMoniker = ({ value }: { value: string }) => {
  // Get FP from our mock data
  const fp = mockFinalityProviders[value];
  const moniker = fp?.description?.moniker || "-";
  const state = fp?.state;

  // Create tooltips similar to the real component
  let tooltip;
  let status: "warning" | "error" | undefined;

  if (state === FinalityProviderState.JAILED) {
    tooltip = (
      <span>
        This finality provider has been jailed.{" "}
        <Link
          className="text-secondary-main"
          target="_blank"
          href={DOCUMENTATION_LINKS.TECHNICAL_PRELIMINARIES}
        >
          Learn more
        </Link>
      </span>
    );
    status = "error";
  } else if (state === FinalityProviderState.SLASHED) {
    tooltip = (
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
    );
    status = "error";
  }

  return (
    <Hint tooltip={tooltip} status={status}>
      {moniker}
    </Hint>
  );
};

// Mock data
const baseDelegation: Omit<
  DelegationV2,
  "state" | "finalityProviderBtcPksHex"
> = {
  stakingTxHex: "020000000001019c8a7a79c3a35e76...",
  paramsVersion: 1,
  stakerBtcPkHex: "02e8f6d4d3f7f6f8...",
  stakingAmount: 1000000, // 0.01 BTC
  stakingTimelock: 1000,
  stakingTxHashHex: "8e7d68c70e0f8d149e87d7c6a5f736f6b5c...",
  startHeight: 800000,
  endHeight: 900000,
  bbnInceptionHeight: 100,
  bbnInceptionTime: "2024-03-20T12:00:00Z",
  unbondingTimelock: 2000,
  unbondingTxHex: "020000000001019c8a7a79c3a35e76...",
  slashing: {
    stakingSlashingTxHex: "020000000001019c8a7a79c3a35e76...",
    unbondingSlashingTxHex: "020000000001019c8a7a79c3a35e76...",
    spendingHeight: 850000,
  },
  covenantUnbondingSignatures: [
    {
      covenantBtcPkHex:
        "03b34b99f22c790c4e36b2b3c2c35a36db06226e41c692fc82b8b56ac1c540c5b1",
      signatureHex: "3045022100e8f6d4d3f7f6f8...",
    },
  ],
};

// Create delegation instances with different transaction hashes and states
const mockDelegations: DelegationV2[] = [
  // Group 1: Active FP with different delegation states
  {
    ...baseDelegation,
    finalityProviderBtcPksHex: [
      "03a34b99f22c790c4e36b2b3c2c35a36db06226e41c692fc82b8b56ac1c540c5b1",
    ],
    state: State.PENDING,
    stakingTxHashHex: "8e7d68c70e0f8d149e87d7c6a5f736f6b5c1",
    bbnInceptionTime: "2024-04-10T10:00:00Z",
  },
  {
    ...baseDelegation,
    finalityProviderBtcPksHex: [
      "03a34b99f22c790c4e36b2b3c2c35a36db06226e41c692fc82b8b56ac1c540c5b1",
    ],
    state: State.VERIFIED,
    stakingTxHashHex: "8e7d68c70e0f8d149e87d7c6a5f736f6b5c2",
    bbnInceptionTime: "2024-04-11T10:00:00Z",
  },
  {
    ...baseDelegation,
    finalityProviderBtcPksHex: [
      "03a34b99f22c790c4e36b2b3c2c35a36db06226e41c692fc82b8b56ac1c540c5b1",
    ],
    state: State.ACTIVE,
    stakingTxHashHex: "8e7d68c70e0f8d149e87d7c6a5f736f6b5c3",
    bbnInceptionTime: "2024-04-12T10:00:00Z",
  },

  // Group 2: Inactive FP with different delegation states
  {
    ...baseDelegation,
    finalityProviderBtcPksHex: [
      "04b45c99f22c790c4e36b2b3c2c35a36db06226e41c692fc82b8b56ac1c540c5b2",
    ],
    state: State.PENDING,
    stakingTxHashHex: "8e7d68c70e0f8d149e87d7c6a5f736f6b5c4",
    bbnInceptionTime: "2024-04-13T10:00:00Z",
  },
  {
    ...baseDelegation,
    finalityProviderBtcPksHex: [
      "04b45c99f22c790c4e36b2b3c2c35a36db06226e41c692fc82b8b56ac1c540c5b2",
    ],
    state: State.VERIFIED,
    stakingTxHashHex: "8e7d68c70e0f8d149e87d7c6a5f736f6b5c5",
    bbnInceptionTime: "2024-04-14T10:00:00Z",
  },
  {
    ...baseDelegation,
    finalityProviderBtcPksHex: [
      "04b45c99f22c790c4e36b2b3c2c35a36db06226e41c692fc82b8b56ac1c540c5b2",
    ],
    state: State.ACTIVE,
    stakingTxHashHex: "8e7d68c70e0f8d149e87d7c6a5f736f6b5c6",
    bbnInceptionTime: "2024-04-15T10:00:00Z",
  },

  // Group 3: Jailed FP with different delegation states
  {
    ...baseDelegation,
    finalityProviderBtcPksHex: [
      "05c56d99f22c790c4e36b2b3c2c35a36db06226e41c692fc82b8b56ac1c540c5b3",
    ],
    state: State.PENDING,
    stakingTxHashHex: "8e7d68c70e0f8d149e87d7c6a5f736f6b5c7",
    bbnInceptionTime: "2024-04-16T10:00:00Z",
  },
  {
    ...baseDelegation,
    finalityProviderBtcPksHex: [
      "05c56d99f22c790c4e36b2b3c2c35a36db06226e41c692fc82b8b56ac1c540c5b3",
    ],
    state: State.VERIFIED,
    stakingTxHashHex: "8e7d68c70e0f8d149e87d7c6a5f736f6b5c8",
    bbnInceptionTime: "2024-04-17T10:00:00Z",
  },
  {
    ...baseDelegation,
    finalityProviderBtcPksHex: [
      "05c56d99f22c790c4e36b2b3c2c35a36db06226e41c692fc82b8b56ac1c540c5b3",
    ],
    state: State.ACTIVE,
    stakingTxHashHex: "8e7d68c70e0f8d149e87d7c6a5f736f6b5c9",
    bbnInceptionTime: "2024-04-18T10:00:00Z",
  },

  // Group 4: Slashed FP with different delegation states
  // active state
  {
    ...baseDelegation,
    finalityProviderBtcPksHex: [
      "06d67e99f22c790c4e36b2b3c2c35a36db06226e41c692fc82b8b56ac1c540c5b4",
    ],
    state: State.ACTIVE,
    stakingTxHashHex: "8e7d68c70e0f8d149e87d7c6a5f736f6b5ca",
    bbnInceptionTime: "2024-04-19T10:00:00Z",
  },
  // verified state
  {
    ...baseDelegation,
    finalityProviderBtcPksHex: [
      "06d67e99f22c790c4e36b2b3c2c35a36db06226e41c692fc82b8b56ac1c540c5b4",
    ],
    state: State.VERIFIED,
    stakingTxHashHex: "8e7d68c70e0f8d149e87d7c6a5f736f6b5ca",
    bbnInceptionTime: "2024-04-19T10:00:00Z",
  },
  // slashed state
  {
    ...baseDelegation,
    finalityProviderBtcPksHex: [
      "06d67e99f22c790c4e36b2b3c2c35a36db06226e41c692fc82b8b56ac1c540c5b4",
    ],
    state: State.SLASHED, // Already slashed delegation
    stakingTxHashHex: "8e7d68c70e0f8d149e87d7c6a5f736f6b5ca",
    bbnInceptionTime: "2024-04-19T10:00:00Z",
  },
  // Invalid state (slashed with undefined startHeight)
  {
    ...baseDelegation,
    finalityProviderBtcPksHex: [
      "06d67e99f22c790c4e36b2b3c2c35a36db06226e41c692fc82b8b56ac1c540c5b4",
    ],
    state: State.SLASHED,
    stakingTxHashHex: "8e7d68c70e0f8d149e87d7c6a5f736f6b5invalid",
    bbnInceptionTime: "2024-04-19T12:00:00Z",
    startHeight: undefined as unknown as number, // Cast to number to satisfy type checking while still being undefined at runtime
  },
  {
    ...baseDelegation,
    finalityProviderBtcPksHex: [
      "06d67e99f22c790c4e36b2b3c2c35a36db06226e41c692fc82b8b56ac1c540c5b4",
    ],
    state: State.TIMELOCK_SLASHING_WITHDRAWABLE, // Withdrawable after slashing
    stakingTxHashHex: "8e7d68c70e0f8d149e87d7c6a5f736f6b5cb",
    bbnInceptionTime: "2024-04-20T10:00:00Z",
  },
  {
    ...baseDelegation,
    finalityProviderBtcPksHex: [
      "06d67e99f22c790c4e36b2b3c2c35a36db06226e41c692fc82b8b56ac1c540c5b4",
    ],
    state: State.EARLY_UNBONDING_SLASHING_WITHDRAWABLE, // Early unbonding slashing
    stakingTxHashHex: "8e7d68c70e0f8d149e87d7c6a5f736f6b5cc",
    bbnInceptionTime: "2024-04-21T10:00:00Z",
  },
  // slashed withdrawn
  {
    ...baseDelegation,
    finalityProviderBtcPksHex: [
      "06d67e99f22c790c4e36b2b3c2c35a36db06226e41c692fc82b8b56ac1c540c5b4",
    ],
    state: State.EARLY_UNBONDING_SLASHING_WITHDRAWN,
    stakingTxHashHex: "8e7d68c70e0f8d149e87d7c6a5f736f6b5cd",
    bbnInceptionTime: "2024-04-22T10:00:00Z",
  },

  // Additional states for completeness
  {
    ...baseDelegation,
    finalityProviderBtcPksHex: [
      "03a34b99f22c790c4e36b2b3c2c35a36db06226e41c692fc82b8b56ac1c540c5b1",
    ],
    state: State.TIMELOCK_UNBONDING,
    stakingTxHashHex: "8e7d68c70e0f8d149e87d7c6a5f736f6b5cd",
    bbnInceptionTime: "2024-04-22T10:00:00Z",
  },
  {
    ...baseDelegation,
    finalityProviderBtcPksHex: [
      "04b45c99f22c790c4e36b2b3c2c35a36db06226e41c692fc82b8b56ac1c540c5b2",
    ],
    state: State.EARLY_UNBONDING_WITHDRAWN,
    stakingTxHashHex: "8e7d68c70e0f8d149e87d7c6a5f736f6b5ce",
    bbnInceptionTime: "2024-04-23T10:00:00Z",
  },
  {
    ...baseDelegation,
    finalityProviderBtcPksHex: [
      "05c56d99f22c790c4e36b2b3c2c35a36db06226e41c692fc82b8b56ac1c540c5b3",
    ],
    state: State.TIMELOCK_WITHDRAWN,
    stakingTxHashHex: "8e7d68c70e0f8d149e87d7c6a5f736f6b5cf",
    bbnInceptionTime: "2024-04-24T10:00:00Z",
  },
];

// Create mock validations
const mockValidations = Object.fromEntries(
  mockDelegations.map((d) => [d.stakingTxHashHex, { valid: true }]),
);

// Create mock slashed statuses
const mockSlashedStatuses = Object.fromEntries(
  mockDelegations.map((d) => {
    // Mark FPs with the slashed state as slashed for the action button
    const isFpSlashed =
      d.finalityProviderBtcPksHex[0] ===
      "06d67e99f22c790c4e36b2b3c2c35a36db06226e41c692fc82b8b56ac1c540c5b4";
    return [d.stakingTxHashHex, { isFpSlashed }];
  }),
);

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
      <MockFinalityProviderMoniker value={row.finalityProviderBtcPksHex[0]} />
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
      const { isFpSlashed } = slashedStatuses[row.stakingTxHashHex] || {};
      const tooltip = isFpSlashed ? (
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
          disabled={!valid}
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
    // delegations, // Comment out to use mock data instead
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
        {networkConfig.bbn.networkFullName} Stakes (With Mock Data)
      </Heading>

      <GridTable
        getRowId={(row) => `${row.stakingTxHashHex}-${row.startHeight}`}
        columns={columns}
        data={mockDelegations}
        loading={false}
        infiniteScroll={false}
        onInfiniteScroll={fetchMoreDelegations}
        classNames={{
          headerRowClassName: "text-accent-primary text-xs",
          headerCellClassName: "p-4 text-align-left text-accent-secondary",
          rowClassName: "group",
          wrapperClassName: "max-h-[50rem] overflow-x-auto", // Increased height to show more rows
          bodyClassName: "min-w-[1000px]",
          cellClassName:
            "p-4 first:pl-4 first:rounded-l last:pr-4 last:rounded-r bg-surface flex items-center text-sm justify-start group-even:bg-secondary-highlight text-accent-primary",
        }}
        params={{
          handleActionClick: openConfirmationModal,
          validations: mockValidations,
          slashedStatuses: mockSlashedStatuses,
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
