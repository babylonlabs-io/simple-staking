import {
  Delegation as DelegationInterface,
  StakingTx,
} from "@/app/api/getDelegations";
import { getState } from "@/utils/getState";
import { trim } from "@/utils/trim";

interface DelegationProps {
  finalityProviderMoniker: string;
  stakingTx: StakingTx;
  stakingValue: number;
  stakingTxID: string;
  state: string;
  onUnbond: (id: string) => void;
  onWithdraw: (id: string) => void;
  intermediateDelegation?: DelegationInterface;
}

export const Delegation: React.FC<DelegationProps> = ({
  stakingTx,
  finalityProviderMoniker,
  stakingTxID,
  state,
  stakingValue,
  onUnbond,
  onWithdraw,
  intermediateDelegation,
}) => {
  const { start_height, timelock, start_timestamp } = stakingTx;

  const generateCTA = () => {
    if (state === "active") {
      return (
        <button
          className="btn btn-link btn-xs text-primary no-underline"
          onClick={() => onUnbond(stakingTxID)}
          disabled={intermediateDelegation?.state === "intermediate_unbonding"}
        >
          unbond
        </button>
      );
    } else if (state === "unbonded") {
      return (
        <button
          className="btn btn-link btn-xs text-secondary no-underline"
          onClick={() => onWithdraw(stakingTxID)}
          disabled={intermediateDelegation?.state === "intermediate_withdrawal"}
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
          {getState(intermediateDelegation?.state || state)}
        </p>
      </div>
      <div className="flex justify-between gap-4">
        {/* convert state to a readable format */}
        <a
          href={`${process.env.NEXT_PUBLIC_MEMPOOL_API}/signet/tx/${stakingTxID}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:underline"
        >
          {trim(stakingTxID)}
        </a>
        {/* unbond or withdraw button */}
        {generateCTA()}
      </div>
    </div>
  );
};
