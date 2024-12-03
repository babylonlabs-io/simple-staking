import { useAppState } from "@/app/state";
import { DelegationV2StakingState as State } from "@/app/types/delegationsV2";
import { BbnStakingParamsVersion } from "@/app/types/networkInfo";
import { Hint } from "@/components/common/Hint";
import { blocksToDisplayTime } from "@/utils/time";

interface StatusProps {
  value: string;
}

const STATUSES: Record<
  string,
  (param?: BbnStakingParamsVersion) => { label: string; tooltip: string }
> = {
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
  [State.TIMELOCK_UNBONDING]: (param) => ({
    label: "Unbonding",
    tooltip:
      "Stake is about to be unbonded as it's reaching the timelock period",
  }),
  [State.EARLY_UNBONDING]: (param) => ({
    label: "Unbonding",
    tooltip: `Unbonding process of ${blocksToDisplayTime(param?.unbondingTime)} has started`,
  }),
  [State.TIMELOCK_WITHDRAWABLE]: () => ({
    label: "Withdrawable",
    tooltip: "Stake is withdrawable as it's reached the timelock period",
  }),
  [State.EARLY_UNBONDING_WITHDRAWABLE]: () => ({
    label: "Withdrawable",
    tooltip: "Stake is withdrawable after the unbonding period",
  }),
  [State.TIMELOCK_SLASHING_WITHDRAWABLE]: () => ({
    label: "Withdrawable",
    tooltip: "Slashed Stake is now withdrawable",
  }),
  [State.EARLY_UNBONDING_SLASHING_WITHDRAWABLE]: () => ({
    label: "Withdrawable",
    tooltip: "Slashed Stake is now withdrawable",
  }),
  [State.SLASHED]: () => ({
    label: "Slashed",
    tooltip: "Stake has been slashed",
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
  [State.INTERMEDIATE_PENDING_VERIFICATION]: () => ({
    label: "Pending",
    tooltip: "Stake is pending verification",
  }),
  [State.INTERMEDIATE_PENDING_BTC_CONFIRMATION]: () => ({
    label: "Pending",
    tooltip: "Stake is pending 10 BTC confirmations",
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

export function Status({ value }: StatusProps) {
  const { networkInfo } = useAppState();
  const { label = "unknown", tooltip = "unknown" } =
    STATUSES[value](networkInfo?.params.bbnStakingParams?.latestParam) ?? {};

  return <Hint tooltip={tooltip}>{label}</Hint>;
}
