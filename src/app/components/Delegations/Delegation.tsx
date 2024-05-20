import { AiOutlineInfoCircle } from "react-icons/ai";
import { Tooltip } from "react-tooltip";
import { IoIosWarning } from "react-icons/io";

import { StakingTx, DelegationState } from "@/app/types/delegations";
import { durationTillNow } from "@/utils/formatTime";
import { getState, getStateTooltip } from "@/utils/getState";
import { trim } from "@/utils/trim";
import { satoshiToBtc } from "@/utils/btcConversions";

interface DelegationProps {
  finalityProviderMoniker: string;
  stakingTx: StakingTx;
  stakingValueSat: number;
  stakingTxHash: string;
  state: string;
  onUnbond: (id: string) => void;
  onWithdraw: (id: string) => void;
  // This attribute is set when an action has been taken by the user
  // that should change the status but the back-end
  // has not had time to reflect this change yet
  intermediateState?: string;
  isOverflow: boolean;
}

export const Delegation: React.FC<DelegationProps> = ({
  stakingTx,
  stakingTxHash,
  state,
  stakingValueSat,
  onUnbond,
  onWithdraw,
  intermediateState,
  isOverflow,
}) => {
  const { startTimestamp } = stakingTx;

  const generateActionButton = () => {
    // This function generates the unbond or withdraw button
    // based on the state of the delegation
    // It also disables the button if the delegation
    // is in an intermediate state (local storage)
    if (state === DelegationState.ACTIVE) {
      return (
        <div>
          <button
            className="btn btn-outline btn-xs inline-flex text-sm font-normal text-primary"
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
            className="btn btn-outline btn-xs inline-flex text-sm font-normal text-primary"
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

  const isActive =
    intermediateState === DelegationState.ACTIVE ||
    state === DelegationState.ACTIVE;

  const renderState = () => {
    // overflow should be shown only on active state
    if (isOverflow && isActive) {
      return getState(DelegationState.OVERFLOW);
    } else {
      return getState(intermediateState || state);
    }
  };

  const renderStateTooltip = () => {
    // overflow should be shown only on active state
    if (isOverflow && isActive) {
      return getStateTooltip(DelegationState.OVERFLOW);
    } else {
      return getStateTooltip(intermediateState || state);
    }
  };

  return (
    <div
      className={`card relative border bg-base-300 p-4 text-sm dark:bg-base-200 ${isOverflow ? "border-primary" : "dark:border-0"}`}
    >
      {isOverflow && (
        <div className="absolute right-2 top-1/2 flex -translate-y-1/2 items-center gap-1 rounded-md bg-primary px-2 py-1 text-sm text-white">
          <IoIosWarning size={20} />
          <p>overflow</p>
        </div>
      )}
      <div className="grid grid-flow-col grid-cols-2 grid-rows-2 items-center gap-2 lg:grid-flow-row lg:grid-cols-5 lg:grid-rows-1">
        <p>{+satoshiToBtc(stakingValueSat).toFixed(6)} Signet BTC</p>
        <p>{durationTillNow(startTimestamp)}</p>
        <a
          href={`${process.env.NEXT_PUBLIC_MEMPOOL_API}/signet/tx/${stakingTxHash}`}
          target="_blank"
          rel="noopener noreferrer"
          className="hidden text-primary hover:underline lg:flex"
        >
          {trim(stakingTxHash)}
        </a>
        <div className="flex">
          <div className="flex items-center gap-1">
            <p>{renderState()}</p>
            <span
              className="cursor-pointer text-xs"
              data-tooltip-id={`tooltip-${stakingTxHash}`}
              data-tooltip-content={renderStateTooltip()}
              data-tooltip-place="top"
            >
              <AiOutlineInfoCircle />
            </span>
            <Tooltip id={`tooltip-${stakingTxHash}`} />
          </div>
        </div>
        {generateActionButton()}
      </div>
    </div>
  );
};
