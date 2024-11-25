import { DelegationV2StakingState as state } from "@/app/types/delegationsV2";

interface ActionButtonProps {
  txHash: string;
  state: string;
  onClick?: (action: string, txHash: string) => void;
}

type ButtonAdapter = (props: ActionButtonProps) => JSX.Element;
type ButtonStrategy = Record<string, ButtonAdapter>;

const ACTION_BUTTONS: ButtonStrategy = {
  [state.VERIFIED]: (props: ActionButtonProps) => (
    <button
      className="btn btn-outline btn-xs inline-flex text-sm font-normal text-primary-dark"
      onClick={() => props.onClick?.("stake", props.txHash)}
      disabled={props.state === state.INTERMEDIATE_PENDING_CONFIRMATION}
    >
      Stake
    </button>
  ),
  [state.ACTIVE]: (props: ActionButtonProps) => (
    <button
      className="btn btn-outline btn-xs inline-flex text-sm font-normal text-primary-dark"
      onClick={() => props.onClick?.("unbound", props.txHash)}
      disabled={props.state === state.INTERMEDIATE_UNBONDING}
    >
      Unbond
    </button>
  ),

  [state.WITHDRAWABLE]: (props: ActionButtonProps) => (
    <button
      className="btn btn-outline btn-xs inline-flex text-sm font-normal text-primary-dark"
      onClick={() => props.onClick?.("withdraw", props.txHash)}
      disabled={props.state === state.INTERMEDIATE_WITHDRAWAL}
    >
      Withdraw
    </button>
  ),
};

export function ActionButton(props: ActionButtonProps) {
  const Button = ACTION_BUTTONS[props.state];

  return <Button {...props} />;
}
