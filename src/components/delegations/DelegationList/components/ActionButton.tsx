import { DELEGATION_ACTIONS as ACTIONS } from "@/app/constants";
import { ActionType } from "@/app/hooks/services/useDelegationService";
import {
  DelegationV2,
  DelegationV2StakingState as State,
} from "@/app/types/delegationsV2";

interface ActionButtonProps {
  delegation: DelegationV2;
  state: string;
  onClick?: (action: ActionType, delegation: DelegationV2) => void;
}

const ACTION_BUTTON_PROPS: Record<
  string,
  { action: ActionType; title: string }
> = {
  [State.VERIFIED]: {
    action: ACTIONS.STAKE,
    title: "Stake",
  },
  [State.ACTIVE]: {
    action: ACTIONS.UNBOUND,
    title: "Unbound",
  },
  [State.EARLY_UNBONDING_WITHDRAWABLE]: {
    action: ACTIONS.WITHDRAW_ON_EARLY_UNBOUNDING,
    title: "Withdraw",
  },
  [State.TIMELOCK_WITHDRAWABLE]: {
    action: ACTIONS.WITHDRAW_ON_TIMELOCK,
    title: "Withdraw",
  },
  [State.TIMELOCK_SLASHING_WITHDRAWABLE]: {
    action: ACTIONS.WITHDRAW_ON_TIMELOCK_SLASHING,
    title: "Withdraw",
  },
  [State.EARLY_UNBONDING_SLASHING_WITHDRAWABLE]: {
    action: ACTIONS.WITHDRAW_ON_EARLY_UNBOUNDING_SLASHING,
    title: "Withdraw",
  },
};

export function ActionButton(props: ActionButtonProps) {
  const buttonProps = ACTION_BUTTON_PROPS[props.state];

  if (!buttonProps) return null;

  return (
    <button
      className="btn btn-outline btn-xs inline-flex text-sm font-normal text-primary-dark"
      onClick={() => props.onClick?.(buttonProps.action, props.delegation)}
    >
      {buttonProps.title}
    </button>
  );
}
