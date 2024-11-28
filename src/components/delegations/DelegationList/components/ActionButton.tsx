import { DELEGATION_ACTIONS as ACTIONS } from "@/app/constants";
import { DelegationV2StakingState as state } from "@/app/types/delegationsV2";

interface ActionButtonProps {
  txHash: string;
  state: string;
  onClick?: (action: string, txHash: string) => void;
}

const ACTION_BUTTON_PROPS: Record<string, { action: string; title: string }> = {
  [state.VERIFIED]: {
    action: ACTIONS.STAKE,
    title: "Stake",
  },
  [state.ACTIVE]: {
    action: ACTIONS.UNBOUND,
    title: "Unbound",
  },
  [state.EARLY_UNBONDING_WITHDRAWABLE]: {
    action: ACTIONS.WITHDRAW_ON_EARLY_UNBOUNDING,
    title: "Withdraw",
  },
  [state.TIMELOCK_WITHDRAWABLE]: {
    action: ACTIONS.WITHDRAW_ON_TIMELOCK,
    title: "Withdraw",
  },
  [state.TIMELOCK_SLASHING_WITHDRAWABLE]: {
    action: ACTIONS.WITHDRAW_ON_TIMELOCK_SLASHING,
    title: "Withdraw",
  },
  [state.EARLY_UNBONDING_SLASHING_WITHDRAWABLE]: {
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
      onClick={() => props.onClick?.(buttonProps.action, props.txHash)}
    >
      {buttonProps.title}
    </button>
  );
}
