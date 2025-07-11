import { Button, Loader } from "@babylonlabs-io/core-ui";

import { Hint } from "@/ui/common/components/Common/Hint";
import { DELEGATION_ACTIONS as ACTIONS } from "@/ui/common/constants";
import { ActionType } from "@/ui/common/hooks/services/useDelegationService";
import {
  DelegationV2StakingState as DelegationState,
  DelegationWithFP,
} from "@/ui/common/types/delegationsV2";
import { FinalityProviderState } from "@/ui/common/types/finalityProviders";

interface ActionButtonProps {
  tooltip?: string | JSX.Element;
  delegation: DelegationWithFP;
  onClick?: (action: ActionType, delegation: DelegationWithFP) => void;
  disabled?: boolean;
  showLoader?: boolean;
}

type Actions = Record<
  string,
  Record<string, { action: ActionType; title: string }>
>;

const ACTION_BUTTON_PROPS: Actions = {
  [FinalityProviderState.ACTIVE]: {
    [DelegationState.VERIFIED]: {
      action: ACTIONS.STAKE,
      title: "Stake",
    },
    [DelegationState.ACTIVE]: {
      action: ACTIONS.UNBOND,
      title: "Unbond",
    },
    [DelegationState.EARLY_UNBONDING_WITHDRAWABLE]: {
      action: ACTIONS.WITHDRAW_ON_EARLY_UNBONDING,
      title: "Withdraw",
    },
    [DelegationState.TIMELOCK_WITHDRAWABLE]: {
      action: ACTIONS.WITHDRAW_ON_TIMELOCK,
      title: "Withdraw",
    },
    [DelegationState.TIMELOCK_SLASHING_WITHDRAWABLE]: {
      action: ACTIONS.WITHDRAW_ON_TIMELOCK_SLASHING,
      title: "Withdraw",
    },
    [DelegationState.EARLY_UNBONDING_SLASHING_WITHDRAWABLE]: {
      action: ACTIONS.WITHDRAW_ON_EARLY_UNBONDING_SLASHING,
      title: "Withdraw",
    },
  },
  [FinalityProviderState.INACTIVE]: {
    [DelegationState.VERIFIED]: {
      action: ACTIONS.STAKE,
      title: "Stake",
    },
    [DelegationState.ACTIVE]: {
      action: ACTIONS.UNBOND,
      title: "Unbond",
    },
    [DelegationState.EARLY_UNBONDING_WITHDRAWABLE]: {
      action: ACTIONS.WITHDRAW_ON_EARLY_UNBONDING,
      title: "Withdraw",
    },
    [DelegationState.TIMELOCK_WITHDRAWABLE]: {
      action: ACTIONS.WITHDRAW_ON_TIMELOCK,
      title: "Withdraw",
    },
    [DelegationState.TIMELOCK_SLASHING_WITHDRAWABLE]: {
      action: ACTIONS.WITHDRAW_ON_TIMELOCK_SLASHING,
      title: "Withdraw",
    },
    [DelegationState.EARLY_UNBONDING_SLASHING_WITHDRAWABLE]: {
      action: ACTIONS.WITHDRAW_ON_EARLY_UNBONDING_SLASHING,
      title: "Withdraw",
    },
  },
  [FinalityProviderState.JAILED]: {
    [DelegationState.VERIFIED]: {
      action: ACTIONS.STAKE,
      title: "Stake",
    },
    [DelegationState.ACTIVE]: {
      action: ACTIONS.UNBOND,
      title: "Unbond",
    },
    [DelegationState.EARLY_UNBONDING_WITHDRAWABLE]: {
      action: ACTIONS.WITHDRAW_ON_EARLY_UNBONDING,
      title: "Withdraw",
    },
    [DelegationState.TIMELOCK_WITHDRAWABLE]: {
      action: ACTIONS.WITHDRAW_ON_TIMELOCK,
      title: "Withdraw",
    },
    [DelegationState.TIMELOCK_SLASHING_WITHDRAWABLE]: {
      action: ACTIONS.WITHDRAW_ON_TIMELOCK_SLASHING,
      title: "Withdraw",
    },
    [DelegationState.EARLY_UNBONDING_SLASHING_WITHDRAWABLE]: {
      action: ACTIONS.WITHDRAW_ON_EARLY_UNBONDING_SLASHING,
      title: "Withdraw",
    },
  },
  [FinalityProviderState.SLASHED]: {
    [DelegationState.ACTIVE]: {
      action: ACTIONS.UNBOND,
      title: "Unbond",
    },
    [DelegationState.EARLY_UNBONDING_WITHDRAWABLE]: {
      action: ACTIONS.WITHDRAW_ON_EARLY_UNBONDING,
      title: "Withdraw",
    },
    [DelegationState.TIMELOCK_WITHDRAWABLE]: {
      action: ACTIONS.WITHDRAW_ON_TIMELOCK,
      title: "Withdraw",
    },
    [DelegationState.TIMELOCK_SLASHING_WITHDRAWABLE]: {
      action: ACTIONS.WITHDRAW_ON_TIMELOCK_SLASHING,
      title: "Withdraw",
    },
    [DelegationState.EARLY_UNBONDING_SLASHING_WITHDRAWABLE]: {
      action: ACTIONS.WITHDRAW_ON_EARLY_UNBONDING_SLASHING,
      title: "Withdraw",
    },
  },
};

export function ActionButton({
  delegation,
  tooltip,
  onClick,
  disabled = false,
  showLoader = false,
}: ActionButtonProps) {
  const buttonProps =
    ACTION_BUTTON_PROPS[delegation.fp?.state]?.[delegation.state];

  if (!buttonProps) return null;

  return (
    <Hint tooltip={tooltip} attachToChildren>
      <Button
        variant="outlined"
        size="small"
        onClick={() => onClick?.(buttonProps.action, delegation)}
        disabled={disabled}
        className="flex items-center gap-1"
      >
        {buttonProps.title}
        {showLoader && <Loader size={12} className="text-accent-primary" />}
      </Button>
    </Hint>
  );
}
