import { DelegationV2StakingState as state } from "@/app/types/delegationsV2";

interface ActionButtonProps {
  txHash: string;
  state: string;
  onClick?: (action: string, txHash: string) => void;
}

type ButtonAdapter = (props: ActionButtonProps) => JSX.Element;
type ButtonStrategy = Record<string, ButtonAdapter>;

const WithdrawButton = (props: ActionButtonProps) => (
  <button
    className="btn btn-outline btn-xs inline-flex text-sm font-normal text-primary-dark"
    onClick={() => props.onClick?.("withdraw", props.txHash)}
    disabled={props.state === state.INTERMEDIATE_WITHDRAWAL_SUBMITTED}
  >
    Withdraw
  </button>
);

const ACTION_BUTTONS: ButtonStrategy = {
  [state.VERIFIED]: (props: ActionButtonProps) => (
    <button
      className="btn btn-outline btn-xs inline-flex text-sm font-normal text-primary-dark"
      onClick={() => props.onClick?.("stake", props.txHash)}
      disabled={props.state === state.INTERMEDIATE_PENDING_BTC_CONFIRMATION}
    >
      Stake
    </button>
  ),
  [state.ACTIVE]: (props: ActionButtonProps) => (
    <button
      className="btn btn-outline btn-xs inline-flex text-sm font-normal text-primary-dark"
      onClick={() => props.onClick?.("unbound", props.txHash)}
      disabled={props.state === state.INTERMEDIATE_UNBONDING_SUBMITTED}
    >
      Unbond
    </button>
  ),

  [state.EARLY_UNBONDING_WITHDRAWABLE]: WithdrawButton,
  [state.TIMELOCK_WITHDRAWABLE]: WithdrawButton,
  [state.TIMELOCK_SLASHING_WITHDRAWABLE]: WithdrawButton,
  [state.EARLY_UNBONDING_SLASHING_WITHDRAWABLE]: WithdrawButton,
};

export function ActionButton(props: ActionButtonProps) {
  const Button = ACTION_BUTTONS[props.state];
  if (!Button) {
    return null;
  }

  return <Button {...props} />;
}
