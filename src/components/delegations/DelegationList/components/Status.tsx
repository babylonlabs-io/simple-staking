import { useMemo, type JSX } from "react";

import { useAppState } from "@/app/state";
import {
  DelegationV2,
  DelegationV2StakingState as State,
} from "@/app/types/delegationsV2";
import { NetworkInfo } from "@/app/types/networkInfo";
import { Hint } from "@/components/common/Hint";
import { getNetworkConfigBTC } from "@/config/network/btc";
import { blocksToDisplayTime } from "@/utils/time";

import { SlashingContent } from "./SlashingContent";

interface StatusProps {
  delegation: DelegationV2;
}

interface StatusParams {
  delegation: DelegationV2;
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
    tooltip: `It will take ${blocksToDisplayTime(networkInfo?.params?.bbnStakingParams.latestParam.unbondingTime ?? 0)} before you can withdraw your stake.`,
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
  [State.INTERMEDIATE_UNBONDING_SUBMITTED]: () => ({
    label: "Unbonding",
    tooltip: "Stake is requesting unbonding",
  }),
  [State.INTERMEDIATE_EARLY_UNBONDING_WITHDRAWAL_SUBMITTED]: () => ({
    label: "Withdrawal",
    tooltip: "Withdrawal transaction pending confirmation on Bitcoin",
  }),
  [State.INTERMEDIATE_EARLY_UNBONDING_SLASHING_WITHDRAWAL_SUBMITTED]: () => ({
    label: "Withdrawal",
    tooltip: "Withdrawal transaction pending confirmation on Bitcoin",
  }),
  [State.INTERMEDIATE_TIMELOCK_WITHDRAWAL_SUBMITTED]: () => ({
    label: "Withdrawal",
    tooltip: "Withdrawal transaction pending confirmation on Bitcoin",
  }),
  [State.INTERMEDIATE_TIMELOCK_SLASHING_WITHDRAWAL_SUBMITTED]: () => ({
    label: "Withdrawal",
    tooltip: "Withdrawal transaction pending confirmation on Bitcoin",
  }),
};

export function Status({ delegation }: StatusProps) {
  const { networkInfo } = useAppState();

  const delegationStatus = useMemo(
    () =>
      STATUSES[delegation.state]({
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
