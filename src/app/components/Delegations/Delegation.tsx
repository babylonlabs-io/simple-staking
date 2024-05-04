import { StakingTx } from "@/app/api/getDelegations";
import { DelegationState } from "@/app/types/delegationState";
import { durationTillNow } from "@/utils/formatTime";
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
  stakingTxHash,
  state,
  stakingValue,
  onUnbond,
  onWithdraw,
  intermediateState,
}) => {
  const { start_height, start_timestamp } = stakingTx;

  const generateActionButton = () => {
    // This function generates the unbond or withdraw button
    // based on the state of the delegation
    // It also disables the button if the delegation
    // is in an intermediate state (local storage)
    if (state === DelegationState.ACTIVE) {
      return (
        <div>
          <button
            className="btn btn-link btn-xs inline-flex text-sm font-normal text-primary no-underline"
            onClick={() => onUnbond(stakingTxHash)}
            disabled={
              intermediateState === DelegationState.INTERMEDIATE_UNBONDING
            }
          >
            Unbond
          </button>
        </div>
      );
    } else if (state === DelegationState.UNBONDED) {
      return (
        <div>
          <button
            className="btn btn-link btn-xs inline-flex text-sm font-normal text-primary no-underline"
            onClick={() => onWithdraw(stakingTxHash)}
            disabled={
              intermediateState === DelegationState.INTERMEDIATE_WITHDRAWAL
            }
          >
            Withdraw
          </button>
        </div>
      );
    } else {
      return null;
    }
  };

  return (
    <div className="card relative border bg-base-300 p-4 text-sm dark:border-0 dark:bg-base-200">
      {/* TODO to be removed after initial dev phase */}
      {/* local storage items has startHeight 0 */}
      {start_height === 0 && (
        <div className="absolute right-0 top-0 rounded-sm bg-red-500 px-1 text-xs text-white">
          <p>local</p>
        </div>
      )}
      <div className="grid grid-flow-col grid-cols-2 grid-rows-2 items-center gap-2 lg:grid-flow-row lg:grid-cols-5 lg:grid-rows-1">
        <p>{stakingValue / 1e8} Signet BTC</p>
        <p>{durationTillNow(start_timestamp)}</p>
        <a
          href={`${process.env.NEXT_PUBLIC_MEMPOOL_API}/signet/tx/${stakingTxHash}`}
          target="_blank"
          rel="noopener noreferrer"
          className="hidden text-primary hover:underline lg:flex"
        >
          {trim(stakingTxHash)}
        </a>
        <div className="flex">
          <p className="card border bg-base-300 px-2 py-1 dark:border-0">
            {getState(intermediateState || state)}
          </p>
        </div>
        {generateActionButton()}
      </div>
    </div>
  );
};
