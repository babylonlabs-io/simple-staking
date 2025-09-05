import { DELEGATION_ACTIONS as ACTIONS } from "@/ui/common/constants";
import { ActionType } from "@/ui/common/hooks/services/useDelegationService";
import {
  DelegationV2StakingState,
  DelegationWithFP,
} from "@/ui/common/types/delegationsV2";
import { FinalityProviderState } from "@/ui/common/types/finalityProviders";

import { ActivityCardActionButton } from "../ActivityCard";

export const getActionButton = (
  delegation: DelegationWithFP,
  onAction: (action: ActionType, delegation: DelegationWithFP) => void,
  isStakingManagerReady: boolean,
  isBroadcastedExpansion?: boolean,
): ActivityCardActionButton | undefined => {
  const { state, fp } = delegation;

  // Define action mapping
  const actionMap: Record<
    string,
    Record<string, { action: ActionType; title: string }>
  > = {
    [FinalityProviderState.ACTIVE]: {
      [DelegationV2StakingState.VERIFIED]: {
        action: ACTIONS.STAKE,
        title: "Stake",
      },
      [DelegationV2StakingState.ACTIVE]: {
        action: ACTIONS.UNBOND,
        title: "Unbond",
      },
      [DelegationV2StakingState.EARLY_UNBONDING_WITHDRAWABLE]: {
        action: ACTIONS.WITHDRAW_ON_EARLY_UNBONDING,
        title: "Withdraw",
      },
      [DelegationV2StakingState.TIMELOCK_WITHDRAWABLE]: {
        action: ACTIONS.WITHDRAW_ON_TIMELOCK,
        title: "Withdraw",
      },
      [DelegationV2StakingState.TIMELOCK_SLASHING_WITHDRAWABLE]: {
        action: ACTIONS.WITHDRAW_ON_TIMELOCK_SLASHING,
        title: "Withdraw",
      },
      [DelegationV2StakingState.EARLY_UNBONDING_SLASHING_WITHDRAWABLE]: {
        action: ACTIONS.WITHDRAW_ON_EARLY_UNBONDING_SLASHING,
        title: "Withdraw",
      },
    },
    [FinalityProviderState.INACTIVE]: {
      [DelegationV2StakingState.VERIFIED]: {
        action: ACTIONS.STAKE,
        title: "Stake",
      },
      [DelegationV2StakingState.ACTIVE]: {
        action: ACTIONS.UNBOND,
        title: "Unbond",
      },
      [DelegationV2StakingState.EARLY_UNBONDING_WITHDRAWABLE]: {
        action: ACTIONS.WITHDRAW_ON_EARLY_UNBONDING,
        title: "Withdraw",
      },
      [DelegationV2StakingState.TIMELOCK_WITHDRAWABLE]: {
        action: ACTIONS.WITHDRAW_ON_TIMELOCK,
        title: "Withdraw",
      },
      [DelegationV2StakingState.TIMELOCK_SLASHING_WITHDRAWABLE]: {
        action: ACTIONS.WITHDRAW_ON_TIMELOCK_SLASHING,
        title: "Withdraw",
      },
      [DelegationV2StakingState.EARLY_UNBONDING_SLASHING_WITHDRAWABLE]: {
        action: ACTIONS.WITHDRAW_ON_EARLY_UNBONDING_SLASHING,
        title: "Withdraw",
      },
    },
    [FinalityProviderState.JAILED]: {
      [DelegationV2StakingState.VERIFIED]: {
        action: ACTIONS.STAKE,
        title: "Stake",
      },
      [DelegationV2StakingState.ACTIVE]: {
        action: ACTIONS.UNBOND,
        title: "Unbond",
      },
      [DelegationV2StakingState.EARLY_UNBONDING_WITHDRAWABLE]: {
        action: ACTIONS.WITHDRAW_ON_EARLY_UNBONDING,
        title: "Withdraw",
      },
      [DelegationV2StakingState.TIMELOCK_WITHDRAWABLE]: {
        action: ACTIONS.WITHDRAW_ON_TIMELOCK,
        title: "Withdraw",
      },
      [DelegationV2StakingState.TIMELOCK_SLASHING_WITHDRAWABLE]: {
        action: ACTIONS.WITHDRAW_ON_TIMELOCK_SLASHING,
        title: "Withdraw",
      },
      [DelegationV2StakingState.EARLY_UNBONDING_SLASHING_WITHDRAWABLE]: {
        action: ACTIONS.WITHDRAW_ON_EARLY_UNBONDING_SLASHING,
        title: "Withdraw",
      },
    },
    [FinalityProviderState.SLASHED]: {
      [DelegationV2StakingState.ACTIVE]: {
        action: ACTIONS.UNBOND,
        title: "Unbond",
      },
      [DelegationV2StakingState.EARLY_UNBONDING_WITHDRAWABLE]: {
        action: ACTIONS.WITHDRAW_ON_EARLY_UNBONDING,
        title: "Withdraw",
      },
      [DelegationV2StakingState.TIMELOCK_WITHDRAWABLE]: {
        action: ACTIONS.WITHDRAW_ON_TIMELOCK,
        title: "Withdraw",
      },
      [DelegationV2StakingState.TIMELOCK_SLASHING_WITHDRAWABLE]: {
        action: ACTIONS.WITHDRAW_ON_TIMELOCK_SLASHING,
        title: "Withdraw",
      },
      [DelegationV2StakingState.EARLY_UNBONDING_SLASHING_WITHDRAWABLE]: {
        action: ACTIONS.WITHDRAW_ON_EARLY_UNBONDING_SLASHING,
        title: "Withdraw",
      },
    },
  };

  const actionConfig = actionMap[fp?.state]?.[state];
  if (!actionConfig) return undefined;

  // Don't show "Stake" button for broadcasted VERIFIED expansions
  // since they're already broadcasted to Bitcoin
  if (
    isBroadcastedExpansion &&
    actionConfig.action === ACTIONS.STAKE &&
    state === DelegationV2StakingState.VERIFIED
  ) {
    return undefined;
  }

  const isUnbondDisabled =
    state === DelegationV2StakingState.ACTIVE && !isStakingManagerReady;

  return {
    label: actionConfig.title,
    onClick: () => onAction(actionConfig.action, delegation),
    variant: "contained",
    size: "medium",
    className: isUnbondDisabled ? "opacity-50" : "",
  };
};
