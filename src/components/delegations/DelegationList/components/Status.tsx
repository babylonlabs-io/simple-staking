import Link from "next/link";
import { ReactNode } from "react";

import { useAppState } from "@/app/state";
import {
  DelegationV2,
  DelegationV2StakingState as State,
} from "@/app/types/delegationsV2";
import { Params } from "@/app/types/networkInfo";
import { Hint } from "@/components/common/Hint";
import { satoshiToBtc } from "@/utils/btc";
import { blocksToDisplayTime } from "@/utils/time";
import { getNetworkConfigBTC } from "@/config/network/btc";

interface StatusProps {
  delegation: DelegationV2;
}

interface StatusTooltipProps {
  params?: Params;
  amount?: number;
  coinName?: string;
}

const STATUSES: Record<
  string,
  (param: StatusTooltipProps) => {
    label: string;
    tooltip: ReactNode;
    status?: "warning" | "error";
  }
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
  [State.TIMELOCK_UNBONDING]: () => ({
    label: "Unbonding",
    tooltip:
      "Stake is about to be unbonded as it's reaching the timelock period",
  }),
  [State.EARLY_UNBONDING]: ({params}) => ({
    label: "Unbonding",
    tooltip: `Unbonding process of ${blocksToDisplayTime(params?.bbnStakingParams.latestParam.unbondingTime)} has started`,
  }),
  [State.TIMELOCK_WITHDRAWABLE]: () => ({
    label: "Withdrawable",
    tooltip: "Stake is withdrawable as it's reached the timelock period",
  }),
  [State.EARLY_UNBONDING_WITHDRAWABLE]: () => ({
    label: "Withdrawable",
    tooltip: "Stake is withdrawable after the unbonding period",
  }),
  [State.TIMELOCK_SLASHING_WITHDRAWABLE]: ({amount, coinName}) => ({
    label: "Withdrawable",
    tooltip: <SlashedTooltip amount={amount} coinName={coinName} />,
    status: "error",
  }),
  [State.EARLY_UNBONDING_SLASHING_WITHDRAWABLE]: ({ amount, coinName }) => ({
    label: "Withdrawable",
    tooltip: (
      <span>
        <SlashedTooltip amount={amount} coinName={coinName} />
      </span>
    ),
    status: "error",
  }),
  [State.SLASHED]: ({ amount, coinName }) => ({
    label: "Slashed",
    tooltip: <SlashedTooltip amount={amount} coinName={coinName} />,
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
  [State.INTERMEDIATE_PENDING_VERIFICATION]: () => ({
    label: "Pending",
    tooltip: "Stake is pending verification",
  }),
  [State.INTERMEDIATE_PENDING_BTC_CONFIRMATION]: ({params}) => ({
    label: "Pending",
    tooltip:
      `Stake is pending` +
      ` ${params?.btcEpochCheckParams.latestParam.btcConfirmationDepth}` +
      ` BTC confirmations`,
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

const SlashedTooltip = ({
  amount,
  coinName,
}: {
  amount?: number;
  coinName?: string;
}) => {
  return (
    <span>
      <b>
        {satoshiToBtc(amount ?? 0)} {coinName}
      </b>{" "}
      was slashed from your stake due to the finality provider you selected
      double voting. {/* TODO: add link */}
      <Link className="text-secondary-main" target="_blank" href="">
        Learn more
      </Link>
    </span>
  );
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
