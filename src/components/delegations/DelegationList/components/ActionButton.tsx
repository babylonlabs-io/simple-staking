import { Transaction } from "bitcoinjs-lib";
import { Tooltip } from "react-tooltip";

import { DELEGATION_ACTIONS as ACTIONS } from "@/app/constants";
import { ActionType } from "@/app/hooks/services/useDelegationService";
import { useAppState } from "@/app/state";
import {
  DelegationV2,
  DelegationV2StakingState as State,
} from "@/app/types/delegationsV2";
import { isTransactionInputAvailable } from "@/utils/delegations";

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
  const { allUTXOs } = useAppState();
  const buttonProps = ACTION_BUTTON_PROPS[props.state];

  if (!buttonProps || !allUTXOs) return null;
  const delegation = props.delegation;

  // For verifed delegation where user will perform stake action,
  // we need to verify that the UTXOs are still available
  // to avoid the user to perform the action on a spent UTXO
  let isButtonDisabled = false;
  if (buttonProps.action === ACTIONS.STAKE) {
    isButtonDisabled = !isTransactionInputAvailable(
      Transaction.fromHex(delegation.stakingTxHex),
      allUTXOs,
    );
  }

  return (
    <span
      className="cursor-pointer"
      data-tooltip-id={`tooltip-delegation-action-${delegation.stakingTxHashHex}-${buttonProps.action}`}
      data-tooltip-content={
        isButtonDisabled ? "Please ensure your UTXOs are still available" : ""
      }
      data-tooltip-place="top"
    >
      <button
        className="btn btn-outline btn-xs inline-flex text-sm font-normal text-primary-dark"
        onClick={() => props.onClick?.(buttonProps.action, props.delegation)}
        disabled={isButtonDisabled}
      >
        {buttonProps.title}
      </button>
      <Tooltip
        id={`tooltip-delegation-action-${delegation.stakingTxHashHex}-${buttonProps.action}`}
        className="tooltip-wrap"
      />
    </span>
  );
}
