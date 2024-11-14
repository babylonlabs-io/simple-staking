import { useAppState } from "@/app/state";
import { DelegationV2StakingState as state } from "@/app/types/delegationsV2";
import { BbnStakingParamsVersion } from "@/app/types/params";
import { Hint } from "@/components/common/Hint";
import { blocksToDisplayTime } from "@/utils/blocksToDisplayTime";

interface StatusProps {
  value: string;
}

const STATUSES: Record<
  string,
  (param?: BbnStakingParamsVersion) => { label: string; tooltip: string }
> = {
  [state.ACTIVE]: () => ({
    label: "Active",
    tooltip: "Stake is active",
  }),
  [state.VERIFIED]: () => ({
    label: "Verified",
    tooltip: "Stake is verified, you can start staking",
  }),
  [state.UNBONDING]: (param) => ({
    label: "Unbonding",
    tooltip: `Unbonding process of ${blocksToDisplayTime(param?.unbondingTime)} has started`,
  }),
  [state.WITHDRAWABLE]: () => ({
    label: "Withdrawable",
    tooltip: "Stake is withdrawable",
  }),
  [state.WITHDRAWN]: () => ({
    label: "Withdrawn",
    tooltip: "Stake has been withdrawn",
  }),
  [state.PENDING]: () => ({
    label: "Pending",
    // TODO: get confirmation depth from params
    // https://github.com/babylonlabs-io/simple-staking/issues/325
    tooltip: `Stake that is pending ${10} Bitcoin confirmations will only be visible from this device`,
  }),
  [state.INTERMEDIATE_PENDING_CONFIRMATION]: () => ({
    label: "Pending",
    tooltip: "Stake is pending confirmation",
  }),
  [state.INTERMEDIATE_UNBONDING]: () => ({
    label: "Requesting Unbonding",
    tooltip: "Stake is requesting unbonding",
  }),
  [state.INTERMEDIATE_WITHDRAWAL]: () => ({
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
