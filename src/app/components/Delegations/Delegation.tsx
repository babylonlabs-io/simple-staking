import { StakingTx } from "@/app/api/getDelegations";
import { trim } from "@/utils/trim";

interface DelegationProps {
  finalityProviderMoniker: string;
  stakingTx: StakingTx;
  stakingValue: number;
  stakingTxID: string;
  state: string;
}

export const Delegation: React.FC<DelegationProps> = ({
  stakingTx,
  finalityProviderMoniker,
  stakingTxID,
  state,
  stakingValue,
}) => {
  const { start_height, timelock, start_timestamp } = stakingTx;

  return (
    <div className="card relative bg-base-200 p-4 text-sm">
      {/* TODO to be removed after initial dev phase */}
      {/* local storage items has startHeight 0 */}
      {start_height === 0 && (
        <div className="absolute right-0 top-0 rounded-sm bg-red-500 px-1 text-xs text-white">
          <p>local</p>
        </div>
      )}
      <div className="flex justify-between gap-4">
        <p>{stakingValue / 1e8} Signet BTC</p>
        <p>{timelock} blocks</p>
      </div>
      <div className="flex justify-between gap-4">
        <p>{finalityProviderMoniker}</p>
        <a
          href={`${process.env.NEXT_PUBLIC_MEMPOOL_API}/signet/tx/${stakingTxID}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:underline"
        >
          {trim(stakingTxID)}
        </a>{" "}
      </div>
      <div className="flex justify-between gap-4">
        <p>{state}</p>
        <p>{new Date(start_timestamp)?.toLocaleDateString()}</p>
      </div>
    </div>
  );
};
