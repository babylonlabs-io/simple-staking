import Link from "next/link";
import { useMemo, type JSX } from "react";

import { DOCUMENTATION_LINKS } from "@/app/constants";
import { useAppState } from "@/app/state";
import {
  DelegationWithFP,
  DelegationV2StakingState as State,
} from "@/app/types/delegationsV2";
import { FinalityProviderState } from "@/app/types/finalityProviders";
import { NetworkInfo } from "@/app/types/networkInfo";
import { Hint } from "@/components/common/Hint";
import { getNetworkConfigBTC } from "@/config/network/btc";
import { blocksToDisplayTime } from "@/utils/time";

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
  }),
  [State.TIMELOCK_SLASHING_WITHDRAWN]: () => ({
    label: "Withdrawn",
    tooltip: "Slashed Stake has been withdrawn",
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
      label: "Invalid",
      tooltip: (
        <>
          This Finality Provider has been slashed and is no longer available for
          staking.{" "}
          <Link
            className="text-secondary-main"
            target="_blank"
            href={DOCUMENTATION_LINKS.TECHNICAL_PRELIMINARIES}
          >
            Learn more
          </Link>
        </>
      ),
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
