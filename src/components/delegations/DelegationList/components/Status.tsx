import { useAppState } from "@/app/state";
import { DelegationV2StakingState as state } from "@/app/types/delegationsV2";
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
  [state.PENDING]: () => ({
    label: "Pending",
    tooltip: "Stake is pending verification",
  }),
  [state.VERIFIED]: () => ({
    label: "Verified",
    tooltip: "Stake is verified, you can start staking",
  }),
  [state.ACTIVE]: () => ({
    label: "Active",
    tooltip: "Stake is active",
  }),
  [state.TIMELOCK_UNBONDING]: (param) => ({
    label: "Unbonding",
    tooltip:
      "Stake is about to be unbonded as it's reaching the timelock period",
  }),
  [state.EARLY_UNBONDING]: (param) => ({
    label: "Unbonding",
    tooltip: `Unbonding process of ${blocksToDisplayTime(param?.unbondingTime)} has started`,
  }),
  [state.TIMELOCK_WITHDRAWABLE]: () => ({
    label: "Withdrawable",
    tooltip: "Stake is withdrawable as it's reached the timelock period",
  }),
  [state.EARLY_UNBONDING_WITHDRAWABLE]: () => ({
    label: "Withdrawable",
    tooltip: "Stake is withdrawable after the unbonding period",
  }),
  [state.TIMELOCK_SLASHING_WITHDRAWABLE]: () => ({
    label: "Withdrawable",
    tooltip: "Slashed Stake is now withdrawable",
  }),
  [state.EARLY_UNBONDING_SLASHING_WITHDRAWABLE]: () => ({
    label: "Withdrawable",
    tooltip: "Slashed Stake is now withdrawable",
  }),
  [state.SLASHED]: () => ({
    label: "Slashed",
    tooltip: "Stake has been slashed",
  }),
  [state.TIMELOCK_WITHDRAWN]: () => ({
    label: "Withdrawn",
    tooltip: "Stake has been withdrawn",
  }),
  [state.EARLY_UNBONDING_WITHDRAWN]: () => ({
    label: "Withdrawn",
    tooltip: "Stake has been withdrawn",
  }),
  [state.EARLY_UNBONDING_SLASHING_WITHDRAWN]: () => ({
    label: "Withdrawn",
    tooltip: "Slashed Stake has been withdrawn",
  }),
  [state.TIMELOCK_SLASHING_WITHDRAWN]: () => ({
    label: "Withdrawn",
    tooltip: "Slashed Stake has been withdrawn",
  }),
  [state.INTERMEDIATE_PENDING_VERIFICATION]: () => ({
    label: "Pending",
    tooltip: "Stake is pending verification",
  }),
  [state.INTERMEDIATE_PENDING_BTC_CONFIRMATION]: () => ({
    label: "Pending",
    tooltip: "Stake is pending 10 BTC confirmations",
  }),
  [state.INTERMEDIATE_UNBONDING_SUBMITTED]: () => ({
    label: "Unbonding",
    tooltip: "Stake is requesting unbonding",
  }),
  [state.INTERMEDIATE_EARLY_UNBONDING_WITHDRAWAL_SUBMITTED]: () => ({
    label: "Withdrawal",
    tooltip: "Withdrawal transaction pending confirmation on Bitcoin",
  }),
  [state.INTERMEDIATE_EARLY_UNBONDING_SLASHING_WITHDRAWAL_SUBMITTED]: () => ({
    label: "Withdrawal",
    tooltip: "Withdrawal transaction pending confirmation on Bitcoin",
  }),
  [state.INTERMEDIATE_TIMELOCK_WITHDRAWAL_SUBMITTED]: () => ({
    label: "Withdrawal",
    tooltip: "Withdrawal transaction pending confirmation on Bitcoin",
  }),
  [state.INTERMEDIATE_TIMELOCK_SLASHING_WITHDRAWAL_SUBMITTED]: () => ({
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
