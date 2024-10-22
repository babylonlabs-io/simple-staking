import { DelegationState } from "../type";

interface ActionButtonProps {
  txHash: string;
  state: string;
  onClick?: (action: string, txHash: string) => void;
}

type ButtonAdapter = (props: ActionButtonProps) => JSX.Element;
type ButtonStrategy = Record<string, ButtonAdapter>;

const ACTION_BUTTONS: ButtonStrategy = {
  [DelegationState.ACTIVE]: (props: ActionButtonProps) => (
    <button
      className="btn btn-outline btn-xs inline-flex text-sm font-normal text-primary"
      onClick={() => props.onClick?.("unbound", props.txHash)}
      disabled={props.state === DelegationState.INTERMEDIATE_UNBONDING}
    >
      Unbond
    </button>
  ),

  [DelegationState.UNBONDED]: (props: ActionButtonProps) => (
    <button
      className="btn btn-outline btn-xs inline-flex text-sm font-normal text-primary"
      onClick={() => props.onClick?.("withdraw", props.txHash)}
      disabled={props.state === DelegationState.INTERMEDIATE_WITHDRAWAL}
    >
      Withdraw
    </button>
  ),
};

export function ActionButton(props: ActionButtonProps) {
  const Button = ACTION_BUTTONS[props.state];

  return <Button {...props} />;
}
