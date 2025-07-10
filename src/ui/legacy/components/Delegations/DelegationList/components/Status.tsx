import { useMemo, type JSX } from "react";

import { Hint } from "@/ui/legacy/components/Common/Hint";
import { getNetworkConfigBTC } from "@/ui/legacy/config/network/btc";
import { DOCUMENTATION_LINKS } from "@/ui/legacy/constants";
import { useAppState } from "@/ui/legacy/state";
import {
  DelegationWithFP,
  DelegationV2StakingState as State,
} from "@/ui/legacy/types/delegationsV2";
import { FinalityProviderState } from "@/ui/legacy/types/finalityProviders";
import { NetworkInfo } from "@/ui/legacy/types/networkInfo";
import { blocksToDisplayTime } from "@/ui/legacy/utils/time";

import { SlashingContent } from "./SlashingContent";

interface StatusProps {
  delegation: DelegationWithFP;
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

const STATUSES: Record<string, StatusAdapter> = {
  [State.PENDING]: () => ({
    label: "Pending",
    tooltip: "Stake is pending verification",
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
  [State.EARLY_UNBONDING]: ({ networkInfo }) => ({
    label: "Unbonding",
    tooltip: `Stake unbonding is in progress. The unbonding time is set to ${blocksToDisplayTime(networkInfo?.params?.bbnStakingParams.latestParam.unbondingTime ?? 0)}.`,
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
  [State.INTERMEDIATE_PENDING_BTC_CONFIRMATION]: ({ networkInfo }) => ({
    label: `Pending ${coinName} Confirmation`,
    tooltip: `Stake is pending ${networkInfo?.params?.btcEpochCheckParams.latestParam.btcConfirmationDepth ?? 0} ${coinName} confirmations`,
  }),
  [State.INTERMEDIATE_UNBONDING_SUBMITTED]: ({ networkInfo }) => ({
    label: "Unbonding",
    tooltip: `Stake unbonding is in progress. The unbonding time is set to ${blocksToDisplayTime(networkInfo?.params?.bbnStakingParams.latestParam.unbondingTime ?? 0)}.`,
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

export function Status({ delegation }: StatusProps) {
  const { networkInfo } = useAppState();

  const delegationStatus = useMemo(
    () =>
      FP_STATUSES[delegation.fp?.state]?.[delegation.state]?.({
        delegation,
        networkInfo,
      }) ??
      STATUSES[delegation.state]?.({
        delegation,
        networkInfo,
      }),
    [delegation, networkInfo],
  );

  const {
    label = "unknown",
    tooltip = "unknown",
    status,
  } = delegationStatus ?? {};

  return (
    <Hint tooltip={tooltip} status={status}>
      {label}
    </Hint>
  );
}
