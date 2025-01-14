import { useMemo, type JSX } from "react";

import { useAppState } from "@/app/state";
import {
  DelegationV2,
  DelegationV2StakingState as State,
} from "@/app/types/delegationsV2";
import { NetworkInfo, Params } from "@/app/types/networkInfo";
import { Hint } from "@/components/common/Hint";
import { getNetworkConfig, NetworkConfig } from "@/config/network";
import { getNetworkConfigBTC } from "@/config/network/btc";
import { getSlashingAmount } from "@/utils/delegations/slashing";
import { getBbnParamByVersion } from "@/utils/params";
import { blocksToDisplayTime } from "@/utils/time";

import { SlashingContent } from "./SlashingContent";

interface StatusProps {
  delegation: DelegationV2;
}

interface StatusTooltipProps {
  params?: Params;
  amount?: number;
  coinName?: string;
  slashingAmount?: number;
  startHeight?: number;
}

interface StatusParams {
  delegation: DelegationV2;
  networkInfo?: NetworkInfo;
  config: NetworkConfig;
}

const { coinName } = getNetworkConfigBTC();

const STATUSES: Record<
  string,
  (param: StatusTooltipProps) => {
    label: string;
    tooltip: string | JSX.Element;
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
  [State.EARLY_UNBONDING]: ({ params }) => ({
    label: "Unbonding",
    tooltip: `It will take ${blocksToDisplayTime(params?.bbnStakingParams.latestParam.unbondingTime ?? 0)} before you can withdraw your stake.`,
  }),
  [State.TIMELOCK_WITHDRAWABLE]: () => ({
    label: "Withdrawable",
    tooltip: "Stake is withdrawable as it's reached the timelock period",
  }),
  [State.EARLY_UNBONDING_WITHDRAWABLE]: () => ({
    label: "Withdrawable",
    tooltip: "Stake is withdrawable after the unbonding period",
  }),
  [State.TIMELOCK_SLASHING_WITHDRAWABLE]: ({
    coinName,
    slashingAmount,
    startHeight,
  }) => ({
    label: "Withdrawable",
    tooltip: (
      <SlashingContent
        coinName={coinName}
        slashingAmount={slashingAmount}
        startHeight={startHeight}
      />
    ),
    status: "error",
  }),
  [State.EARLY_UNBONDING_SLASHING_WITHDRAWABLE]: ({
    coinName,
    slashingAmount,
    startHeight,
  }) => ({
    label: "Withdrawable",
    tooltip: (
      <SlashingContent
        coinName={coinName}
        slashingAmount={slashingAmount}
        startHeight={startHeight}
      />
    ),
    status: "error",
  }),
  [State.SLASHED]: ({ startHeight, slashingAmount, coinName }) => ({
    label: startHeight === undefined ? "Invalid" : "Slashed",
    tooltip: (
      <SlashingContent
        coinName={coinName}
        slashingAmount={slashingAmount}
        startHeight={startHeight}
      />
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
  [State.INTERMEDIATE_PENDING_BTC_CONFIRMATION]: ({ params }) => ({
    label: `Pending ${coinName} Confirmation`,
    tooltip: `Stake is pending ${params?.btcEpochCheckParams.latestParam.btcConfirmationDepth ?? 0} ${coinName} confirmations`,
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

/**
 * Determines the delegation status and tooltip based on its current state
 * @param delegation - The delegation object containing state and other properties
 * @param networkInfo - Network parameters and configuration
 * @param config - Network-specific configuration (BTC, BBN)
 * @returns Status object containing label, tooltip and optional status indicator
 */
const getDelegationStatus = ({
  delegation,
  networkInfo,
  config,
}: StatusParams) => {
  const slashingAmount = getSlashingAmount(
    delegation.stakingAmount,
    getBbnParamByVersion(
      delegation.paramsVersion,
      networkInfo?.params.bbnStakingParams.versions || [],
    ),
  );

  return STATUSES[delegation.state]({
    params: networkInfo?.params,
    amount: delegation.stakingAmount,
    coinName: config.btc.coinName,
    slashingAmount,
    startHeight: delegation.startHeight,
  });
};

export function Status({ delegation }: StatusProps) {
  const { networkInfo } = useAppState();
  const networkConfig = getNetworkConfig();

  const delegationStatus = useMemo(
    () =>
      getDelegationStatus({
        delegation,
        networkInfo,
        config: networkConfig,
      }),
    [
      delegation.stakingAmount,
      delegation.paramsVersion,
      delegation.state,
      delegation.startHeight,
      networkInfo?.params,
      networkConfig.btc.coinName,
    ],
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
