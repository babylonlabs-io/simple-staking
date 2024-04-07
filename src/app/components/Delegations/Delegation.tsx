import { StakingTx } from "@/app/api/getDelegations";
import { INTERMEDIATE_UNBONDING, INTERMEDIATE_WITHDRAWAL } from "@/app/types/local_storage/intermediate";
import { getState } from "@/utils/getState";
import { trim } from "@/utils/trim";

interface DelegationProps {
  finalityProviderMoniker: string;
  stakingTx: StakingTx;
  stakingValue: number;
  stakingTxHash: string;
  state: string;
  onUnbond: (id: string) => void;
  onWithdraw: (id: string) => void;
  // This attribute is set when an action has been taken by the user
  // that should change the status but the back-end
  // has not had time to reflect this change yet
  intermediateState?: string;
}

export const Delegation: React.FC<DelegationProps> = ({
  stakingTx,
  finalityProviderMoniker,
  stakingTxHash,
  state,
  stakingValue,
  onUnbond,
  onWithdraw,
  intermediateState,
}) => {
  const { start_height, timelock, start_timestamp } = stakingTx;

  const generateActionButton = () => {
    // This function generates the unbond or withdraw button
    // based on the state of the delegation
    // It also disables the button if the delegation
    // is in an intermediate state (local storage)
    if (state === "active") {
      return (
        <button
          className="btn btn-link btn-xs text-primary no-underline"
          onClick={() => onUnbond(stakingTxHash)}
          disabled={intermediateState === INTERMEDIATE_UNBONDING}
        >
          unbond
        </button>
      );
    } else if (state === "unbonded") {
      return (
        <button
          className="btn btn-link btn-xs text-secondary no-underline"
          onClick={() => onWithdraw(stakingTxHash)}
          disabled={intermediateState === INTERMEDIATE_WITHDRAWAL}
        >
          withdraw
        </button>
      );
    } else {
      return null;
    }
  };

  return (
    <div className="card relative gap-2 bg-base-200 p-4 text-sm">
      {/* TODO to be removed after initial dev phase */}
      {/* local storage items has startHeight 0 */}
      {start_height === 0 && (
        <div className="absolute right-0 top-0 rounded-sm bg-red-500 px-1 text-xs text-white">
          <p>local</p>
        </div>
      )}
      <div className="flex justify-between gap-4">
        <p>
          {stakingValue / 1e8}
          <br />
          Signet BTC
        </p>
        <div className="flex flex-col items-end">
          <p>{timelock} blocks</p>
          {/* convert date to a readable format */}
          <p>{new Date(start_timestamp)?.toLocaleDateString()}</p>
        </div>
      </div>
      <div className="flex justify-between gap-4">
        <p className="text-left">{finalityProviderMoniker}</p>
        <p className="text-right">
          {/* convert state to a readable format */}
          {getState(intermediateState || state)}
        </p>
      </div>
      <div className="flex justify-between gap-4">
        <a
          href={`${process.env.NEXT_PUBLIC_MEMPOOL_API}/signet/tx/${stakingTxHash}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:underline"
        >
          {trim(stakingTxHash)}
        </a>
        {/* unbond or withdraw button */}
        {generateActionButton()}
      </div>
    </div>
  );
};
