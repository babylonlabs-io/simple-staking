import { Button } from "@babylonlabs-io/core-ui";

import { DELEGATION_ACTIONS as ACTIONS } from "@/app/constants";
import { ActionType } from "@/app/hooks/services/useDelegationService";
import {
  DelegationV2StakingState as DelegationState,
  DelegationWithFP,
} from "@/app/types/delegationsV2";
import { FinalityProviderState } from "@/app/types/finalityProviders";
import { Hint } from "@/components/common/Hint";

interface ActionButtonProps {
  disabled?: boolean;
  tooltip?: string | JSX.Element;
  delegation: DelegationWithFP;
  onClick?: (action: ActionType, delegation: DelegationWithFP) => void;
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
  },
  [FinalityProviderState.INACTIVE]: {},
  [FinalityProviderState.JAILED]: {},
  [FinalityProviderState.SLASHED]: {},
};

const FALLBACK_PROPS: Record<string, { action: ActionType; title: string }> = {
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
};

export function ActionButton({
  disabled,
  delegation,
  tooltip,
  onClick,
}: ActionButtonProps) {
  const buttonProps =
    ACTION_BUTTON_PROPS[delegation.fp.state]?.[delegation.state] ??
    FALLBACK_PROPS[delegation.state];

  if (!buttonProps) return null;

  return (
    <Hint tooltip={tooltip} attachToChildren>
      <Button
        variant="outlined"
        size="small"
        onClick={() => onClick?.(buttonProps.action, delegation)}
        disabled={disabled}
      >
        {buttonProps.title}
      </Button>
    </Hint>
  );
}
