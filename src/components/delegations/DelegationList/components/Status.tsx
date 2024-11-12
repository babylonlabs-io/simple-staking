import { useAppState } from "@/app/state";
import { BbnStakingParamsVersion } from "@/app/types/params";
import { Hint } from "@/components/common/Hint";
import { blocksToDisplayTime } from "@/utils/blocksToDisplayTime";

import { DelegationState } from "../type";

interface StatusProps {
  value: string;
}

const STATUSES: Record<
  string,
  (state?: BbnStakingParamsVersion) => { label: string; tooltip: string }
> = {
  [DelegationState.ACTIVE]: () => ({
    label: "Active",
    tooltip: "Stake is active",
  }),
  [DelegationState.UNBONDING_REQUESTED]: () => ({
    label: "Unbonding Requested",
    tooltip: "Unbonding requested",
  }),
  [DelegationState.UNBONDING]: (state) => ({
    label: "Unbonding",
    tooltip: `Unbonding process of ${blocksToDisplayTime(state?.unbondingTime)} has started`,
  }),
  [DelegationState.UNBONDED]: () => ({
    label: "Unbonded",
    tooltip: "Stake has been unbonded",
  }),
  [DelegationState.WITHDRAWN]: () => ({
    label: "Withdrawn",
    tooltip: "Stake has been withdrawn",
  }),
  [DelegationState.PENDING]: (state) => ({
    label: "Pending",
    // TODO: get confirmation depth from params
    // https://github.com/babylonlabs-io/simple-staking/issues/325
    tooltip: `Stake that is pending ${10} Bitcoin confirmations will only be visible from this device`,
  }),
  [DelegationState.OVERFLOW]: () => ({
    label: "Overflow",
    tooltip: "Stake is over the staking cap",
  }),
  [DelegationState.EXPIRED]: () => ({
    label: "Expired",
    tooltip: "Stake timelock has expired",
  }),
  [DelegationState.INTERMEDIATE_UNBONDING]: () => ({
    label: "Requesting Unbonding",
    tooltip: "Stake is requesting unbonding",
  }),
  [DelegationState.INTERMEDIATE_WITHDRAWAL]: () => ({
    label: "Withdrawal Submitted",
    tooltip: "Withdrawal transaction pending confirmation on Bitcoin",
  }),
};

export function Status({ value }: StatusProps) {
  const { params } = useAppState();
  const { label = "unknown", tooltip = "unknown" } =
    STATUSES[value](params?.bbnStakingParams?.latestParam) ?? {};

  return <Hint tooltip={tooltip}>{label}</Hint>;
}
