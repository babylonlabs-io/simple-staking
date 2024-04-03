import { LocalStorageDelegation } from "@/types/LocalStorageDelegation";
import { trim } from "@/utils/trim";

interface DelegationProps {
  item: LocalStorageDelegation;
}

export const Delegation: React.FC<DelegationProps> = ({ item }) => {
  const {
    amount,
    duration,
    finalityProviderMoniker,
    stakingTxID,
    state,
    inception,
  } = item;
  return (
    <div className="card bg-base-200 p-4 text-sm">
      <div className="flex justify-between gap-4">
        <p>{amount} Signet BTC</p>
        <p>{duration} days</p>
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
        <p>{state.valueOf()}</p>
        <p>{new Date(Date.now() - inception).toLocaleDateString()}</p>
      </div>
    </div>
  );
};
