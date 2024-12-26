import Link from "next/link";
import { ReactNode } from "react";

import { DOCUMENTATION_LINKS } from "@/app/constants";
import { useAppState } from "@/app/state";
import {
  DelegationV2,
  DelegationV2StakingState as State,
} from "@/app/types/delegationsV2";
import { Params } from "@/app/types/networkInfo";
import { Hint } from "@/components/common/Hint";
import { getNetworkConfigBTC } from "@/config/network/btc";
import { satoshiToBtc } from "@/utils/btc";
import { blocksToDisplayTime } from "@/utils/time";

interface StatusProps {
  delegation: DelegationV2;
}

interface StatusTooltipProps {
  params?: Params;
  amount?: number;
  coinName?: string;
}

const STATUS_LABELS = {
  PENDING: "Pending",
  VERIFIED: "Verified",
  ACTIVE: "Active",
  UNBONDING: "Unbonding",
  WITHDRAWABLE: "Withdrawable",
  SLASHED: "Slashed",
  WITHDRAWN: "Withdrawn",
  WITHDRAWAL: "Withdrawal",
} as const;

const STATUS_MESSAGES = {
  PENDING: "Stake is pending verification",
  VERIFIED: "Stake is verified, you can start staking",
  ACTIVE: "Stake is active",
  TIMELOCK_UNBONDING:
    "Stake is about to be unbonded as it's reaching the timelock period",
  TIMELOCK_WITHDRAWABLE:
    "Stake is withdrawable as it's reached the timelock period",
  EARLY_UNBONDING_WITHDRAWABLE:
    "Stake is withdrawable after the unbonding period",
  WITHDRAWN: "Stake has been withdrawn",
  SLASHED_WITHDRAWN: "Slashed Stake has been withdrawn",
  PENDING_BTC_CONFIRMATION: (btcConfirmationDepth: number) =>
    `Stake is pending ${btcConfirmationDepth} BTC confirmations`,
  UNBONDING_SUBMITTED: "Stake is requesting unbonding",
  WITHDRAWAL_PENDING: "Withdrawal transaction pending confirmation on Bitcoin",
  UNBONDING: (unbondingTime: number) =>
    `It will take ${blocksToDisplayTime(unbondingTime)} before you can withdraw your stake.`,
  SLASHED: (amount: number, coinName: string) => (
    <>
      <b>
        {satoshiToBtc(amount)} {coinName}
      </b>{" "}
      was slashed from your stake due to the finality provider double voting.{" "}
      <Link
        className="text-secondary-main"
        target="_blank"
        href={DOCUMENTATION_LINKS.TECHNICAL_PRELIMINARIES}
      >
        Learn more
      </Link>
    </>
  ),
} as const;

const STATUSES: Record<
  string,
  (param: StatusTooltipProps) => {
    label: string;
    tooltip: ReactNode;
    status?: "warning" | "error";
  }
> = {
  [State.PENDING]: () => ({
    label: STATUS_LABELS.PENDING,
    tooltip: STATUS_MESSAGES.PENDING,
  }),
  [State.VERIFIED]: () => ({
    label: STATUS_LABELS.VERIFIED,
    tooltip: STATUS_MESSAGES.VERIFIED,
  }),
  [State.ACTIVE]: () => ({
    label: STATUS_LABELS.ACTIVE,
    tooltip: STATUS_MESSAGES.ACTIVE,
  }),
  [State.TIMELOCK_UNBONDING]: () => ({
    label: STATUS_LABELS.UNBONDING,
    tooltip: STATUS_MESSAGES.TIMELOCK_UNBONDING,
  }),
  [State.EARLY_UNBONDING]: ({ params }) => ({
    label: STATUS_LABELS.UNBONDING,
    tooltip: STATUS_MESSAGES.UNBONDING(
      params?.bbnStakingParams.latestParam.unbondingTime ?? 0,
    ),
  }),
  [State.TIMELOCK_WITHDRAWABLE]: () => ({
    label: STATUS_LABELS.WITHDRAWABLE,
    tooltip: STATUS_MESSAGES.TIMELOCK_WITHDRAWABLE,
  }),
  [State.EARLY_UNBONDING_WITHDRAWABLE]: () => ({
    label: STATUS_LABELS.WITHDRAWABLE,
    tooltip: STATUS_MESSAGES.EARLY_UNBONDING_WITHDRAWABLE,
  }),
  [State.TIMELOCK_SLASHING_WITHDRAWABLE]: ({ amount, coinName }) => ({
    label: STATUS_LABELS.WITHDRAWABLE,
    tooltip: STATUS_MESSAGES.SLASHED(amount ?? 0, coinName ?? ""),
    status: "error",
  }),
  [State.EARLY_UNBONDING_SLASHING_WITHDRAWABLE]: ({ amount, coinName }) => ({
    label: STATUS_LABELS.WITHDRAWABLE,
    tooltip: STATUS_MESSAGES.SLASHED(amount ?? 0, coinName ?? ""),
    status: "error",
  }),
  [State.SLASHED]: ({ amount, coinName }) => ({
    label: STATUS_LABELS.SLASHED,
    tooltip: STATUS_MESSAGES.SLASHED(amount ?? 0, coinName ?? ""),
    status: "error",
  }),
  [State.TIMELOCK_WITHDRAWN]: () => ({
    label: STATUS_LABELS.WITHDRAWN,
    tooltip: STATUS_MESSAGES.WITHDRAWN,
  }),
  [State.EARLY_UNBONDING_WITHDRAWN]: () => ({
    label: STATUS_LABELS.WITHDRAWN,
    tooltip: STATUS_MESSAGES.WITHDRAWN,
  }),
  [State.EARLY_UNBONDING_SLASHING_WITHDRAWN]: () => ({
    label: STATUS_LABELS.WITHDRAWN,
    tooltip: STATUS_MESSAGES.SLASHED_WITHDRAWN,
  }),
  [State.TIMELOCK_SLASHING_WITHDRAWN]: () => ({
    label: STATUS_LABELS.WITHDRAWN,
    tooltip: STATUS_MESSAGES.SLASHED_WITHDRAWN,
  }),
  // Intermediate States
  [State.INTERMEDIATE_PENDING_VERIFICATION]: () => ({
    label: STATUS_LABELS.PENDING,
    tooltip: STATUS_MESSAGES.PENDING,
  }),
  [State.INTERMEDIATE_PENDING_BTC_CONFIRMATION]: ({ params }) => ({
    label: STATUS_LABELS.PENDING,
    tooltip: STATUS_MESSAGES.PENDING_BTC_CONFIRMATION(
      params?.btcEpochCheckParams.latestParam.btcConfirmationDepth ?? 0,
    ),
  }),
  [State.INTERMEDIATE_UNBONDING_SUBMITTED]: () => ({
    label: STATUS_LABELS.UNBONDING,
    tooltip: STATUS_MESSAGES.UNBONDING_SUBMITTED,
  }),
  [State.INTERMEDIATE_EARLY_UNBONDING_WITHDRAWAL_SUBMITTED]: () => ({
    label: STATUS_LABELS.WITHDRAWAL,
    tooltip: STATUS_MESSAGES.WITHDRAWAL_PENDING,
  }),
  [State.INTERMEDIATE_EARLY_UNBONDING_SLASHING_WITHDRAWAL_SUBMITTED]: () => ({
    label: STATUS_LABELS.WITHDRAWAL,
    tooltip: STATUS_MESSAGES.WITHDRAWAL_PENDING,
  }),
  [State.INTERMEDIATE_TIMELOCK_WITHDRAWAL_SUBMITTED]: () => ({
    label: STATUS_LABELS.WITHDRAWAL,
    tooltip: STATUS_MESSAGES.WITHDRAWAL_PENDING,
  }),
  [State.INTERMEDIATE_TIMELOCK_SLASHING_WITHDRAWAL_SUBMITTED]: () => ({
    label: STATUS_LABELS.WITHDRAWAL,
    tooltip: STATUS_MESSAGES.WITHDRAWAL_PENDING,
  }),
};

export function Status({ delegation }: StatusProps) {
  const { networkInfo } = useAppState();
  const { coinName } = getNetworkConfigBTC();
  const {
    label = "unknown",
    tooltip = "unknown",
    status,
  } = STATUSES[delegation.state]({
    params: networkInfo?.params,
    amount: delegation.stakingAmount,
    coinName,
  }) ?? {};

  return (
    <Hint tooltip={tooltip} status={status}>
      {label}
    </Hint>
  );
}
