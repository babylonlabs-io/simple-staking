import { Button } from "@babylonlabs-io/bbn-core-ui";
import { useId } from "react";
import { Tooltip } from "react-tooltip";

import { DELEGATION_ACTIONS as ACTIONS } from "@/app/constants";
import { ActionType } from "@/app/hooks/services/useDelegationService";
import {
  DelegationV2,
  DelegationV2StakingState as State,
} from "@/app/types/delegationsV2";

interface ActionButtonProps {
  disabled?: boolean;
  tooltip?: string;
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
    action: ACTIONS.UNBOND,
    title: "Unbond",
  },
  [State.EARLY_UNBONDING_WITHDRAWABLE]: {
    action: ACTIONS.WITHDRAW_ON_EARLY_UNBONDING,
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
    action: ACTIONS.WITHDRAW_ON_EARLY_UNBONDING_SLASHING,
    title: "Withdraw",
  },
};

export function ActionButton(props: ActionButtonProps) {
  const tooltipId = useId();
  const buttonProps = ACTION_BUTTON_PROPS[State.VERIFIED]; // ACTION_BUTTON_PROPS[props.state];

  if (!buttonProps) return null;

  return (
    <span
      className="cursor-pointer"
      data-tooltip-id={tooltipId}
      data-tooltip-content={props.tooltip}
      data-tooltip-place="top"
    >
      <Button
        variant="outlined"
        size="small"
        onClick={() => props.onClick?.(buttonProps.action, props.delegation)}
        disabled={props.disabled}
      >
        {buttonProps.title}
      </Button>

      <Tooltip id={tooltipId} className="tooltip-wrap" />
    </span>
  );
}
