import { useMemo, type JSX } from "react";

import { Hint } from "@/ui/common/components/Common/Hint";
import { getNetworkConfigBTC } from "@/ui/common/config/network/btc";
import { DOCUMENTATION_LINKS } from "@/ui/common/constants";
import { useAppState } from "@/ui/common/state";
import {
  DelegationWithFP,
  DelegationV2StakingState as State,
} from "@/ui/common/types/delegationsV2";
import { FinalityProviderState } from "@/ui/common/types/finalityProviders";
import { NetworkInfo } from "@/ui/common/types/networkInfo";

import { SlashingContent } from "./SlashingContent";

interface StatusProps {
  delegation: DelegationWithFP;
  showTooltip?: boolean;
  isBroadcastedVerifiedExpansion?: boolean;
}

interface StatusParams {
  delegation: DelegationWithFP;
  networkInfo?: NetworkInfo;
}

type StatusAdapter = (props: StatusParams) => {
  label: string;
  tooltip: string | JSX.Element;
  status?: "warning" | "error";
};

const { coinName } = getNetworkConfigBTC();

/**
 * Helper function to generate status for pending BTC confirmation states
 * Handles both regular pending and expansion pending states
 */
const getPendingBTCConfirmationStatus = (
  delegation: DelegationWithFP,
  networkInfo?: NetworkInfo,
) => {
  const isExpansion = !!delegation.previousStakingTxHashHex;
  const confirmationDepth =
    networkInfo?.params?.btcEpochCheckParams.latestParam.btcConfirmationDepth ??
    0;

  const label = isExpansion
    ? `Expansion Pending ${coinName} Confirmation`
    : `Pending ${coinName} Confirmation`;

  const tooltip = isExpansion
    ? `Stake expansion is pending ${confirmationDepth} ${coinName} confirmations`
    : `Stake is pending ${confirmationDepth} ${coinName} confirmations`;

  return { label, tooltip };
};

const STATUSES: Record<string, StatusAdapter> = {
  [State.PENDING]: () => ({
    label: "Pending",
    tooltip:
      "Your delegation is still pending. On average, staking transactions are fully confirmed by the Bitcoin chain in 5 hours, depending on Bitcoin block times. Longer delays might be due to slow Bitcoin block times or using low network fees.",
  }),
  [State.VERIFIED]: () => ({
    label: "Verified",
    tooltip: "Stake is verified, you can start staking",
  }),
  [State.ACTIVE]: () => ({
    label: "Active",
    tooltip: "Stake is active",
  }),
  [State.TIMELOCK_UNBONDING]: () => ({
    label: "Unbonding",
    tooltip:
      "Stake is about to be unbonded as it's reaching the timelock period",
  }),
  [State.EARLY_UNBONDING]: () => ({
    label: "Unbonding",
    tooltip: "Stake unbonding is in progress.",
  }),
  [State.TIMELOCK_WITHDRAWABLE]: () => ({
    label: "Withdrawable",
    tooltip: "Stake is withdrawable as it's reached the timelock period",
  }),
  [State.EARLY_UNBONDING_WITHDRAWABLE]: () => ({
    label: "Withdrawable",
    tooltip: "Stake is withdrawable after the unbonding period",
  }),
  [State.TIMELOCK_SLASHING_WITHDRAWABLE]: ({ delegation, networkInfo }) => ({
    label: "Withdrawable",
    tooltip: (
      <SlashingContent delegation={delegation} networkInfo={networkInfo} />
    ),
    status: "error",
  }),
  [State.EARLY_UNBONDING_SLASHING_WITHDRAWABLE]: ({
    delegation,
    networkInfo,
  }) => ({
    label: "Withdrawable",
    tooltip: (
      <SlashingContent delegation={delegation} networkInfo={networkInfo} />
    ),
    status: "error",
  }),
  [State.SLASHED]: ({ delegation, networkInfo }) => ({
    label: delegation.startHeight === undefined ? "Invalid" : "Slashed",
    tooltip: (
      <SlashingContent delegation={delegation} networkInfo={networkInfo} />
    ),
    status: "error",
  }),
  [State.EXPANDED]: () => ({
    label: "Expanded",
    tooltip: "Delegation has been expanded/renewed to a new delegation",
  }),
  [State.TIMELOCK_WITHDRAWN]: () => ({
    label: "Withdrawn",
    tooltip: "Stake has been withdrawn",
  }),
  [State.EARLY_UNBONDING_WITHDRAWN]: () => ({
    label: "Withdrawn",
    tooltip: "Stake has been withdrawn",
  }),
  [State.EARLY_UNBONDING_SLASHING_WITHDRAWN]: () => ({
    label: "Withdrawn",
    tooltip: "Slashed Stake has been withdrawn",
    status: "error",
  }),
  [State.TIMELOCK_SLASHING_WITHDRAWN]: () => ({
    label: "Withdrawn",
    tooltip: "Slashed Stake has been withdrawn",
    status: "error",
  }),
  // Intermediate States
  [State.INTERMEDIATE_PENDING_VERIFICATION]: () => ({
    label: "Pending",
    tooltip: "Stake is pending verification",
  }),
  [State.INTERMEDIATE_PENDING_BTC_CONFIRMATION]: ({
    delegation,
    networkInfo,
  }) => getPendingBTCConfirmationStatus(delegation, networkInfo),
  [State.INTERMEDIATE_UNBONDING_SUBMITTED]: () => ({
    label: "Unbonding",
    tooltip: "Stake unbonding is in progress.",
  }),
  [State.INTERMEDIATE_EARLY_UNBONDING_WITHDRAWAL_SUBMITTED]: () => ({
    label: "Withdrawing",
    tooltip: "Withdrawal transaction pending confirmation on Bitcoin",
  }),
  [State.INTERMEDIATE_EARLY_UNBONDING_SLASHING_WITHDRAWAL_SUBMITTED]: () => ({
    label: "Withdrawing",
    tooltip: "Withdrawal transaction pending confirmation on Bitcoin",
  }),
  [State.INTERMEDIATE_TIMELOCK_WITHDRAWAL_SUBMITTED]: () => ({
    label: "Withdrawing",
    tooltip: "Withdrawal transaction pending confirmation on Bitcoin",
  }),
  [State.INTERMEDIATE_TIMELOCK_SLASHING_WITHDRAWAL_SUBMITTED]: () => ({
    label: "Withdrawing",
    tooltip: "Withdrawal transaction pending confirmation on Bitcoin",
  }),
};

const FP_STATUSES: Record<string, Record<string, StatusAdapter>> = {
  [FinalityProviderState.ACTIVE]: {},
  [FinalityProviderState.SLASHED]: {
    [State.VERIFIED]: () => ({
      label: "Verified",
      tooltip: (
        <>
          This Finality Provider has been slashed and is no longer available for
          staking.{" "}
          <a
            className="text-secondary-main"
            target="_blank"
            href={DOCUMENTATION_LINKS.TECHNICAL_PRELIMINARIES}
          >
            Learn more
          </a>
        </>
      ),
    }),
    [State.ACTIVE]: () => ({
      label: "Active",
      tooltip: "",
    }),
  },
  [FinalityProviderState.INACTIVE]: {},
  [FinalityProviderState.JAILED]: {},
};

export function Status({
  delegation,
  showTooltip = true,
  isBroadcastedVerifiedExpansion = false,
}: StatusProps) {
  const { networkInfo } = useAppState();

  const delegationStatus = useMemo(() => {
    // Handle special case: broadcasted VERIFIED expansions should show pending status
    if (isBroadcastedVerifiedExpansion) {
      const pendingStatus = getPendingBTCConfirmationStatus(
        delegation,
        networkInfo,
      );
      return { ...pendingStatus, status: undefined }; // Add missing status property
    }

    return (
      FP_STATUSES[delegation.fp?.state]?.[delegation.state]?.({
        delegation,
        networkInfo,
      }) ??
      STATUSES[delegation.state]?.({
        delegation,
        networkInfo,
      })
    );
  }, [delegation, networkInfo, isBroadcastedVerifiedExpansion]);

  const {
    label = "unknown",
    tooltip = "unknown",
    status,
  } = delegationStatus ?? { label: "unknown", tooltip: "unknown" };

  return (
    <Hint tooltip={showTooltip ? tooltip : undefined} status={status}>
      {label}
    </Hint>
  );
}
