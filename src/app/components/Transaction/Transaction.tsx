interface TransactionProps {
  stakingTx: string;
  mempoolTxID?: string;
}

export const Transaction: React.FC<TransactionProps> = ({
  stakingTx,
  mempoolTxID,
}) => {
  return (
    <div className="card bg-base-300">
      <div className="card-body items-center gap-4">
        <div className="flex w-full max-w-sm flex-col gap-2">
          <h2 className="font-bold">Staking transaction:</h2>
          <p className="break-words text-sm text-gray-500">{stakingTx}</p>
        </div>
        {mempoolTxID && (
          <div className="flex w-full max-w-sm flex-col gap-2">
            <h2 className="font-bold">Mempool transaction:</h2>
            <a
              href={`https://mempool.space/signet/tx/${mempoolTxID}`}
              target="_blank"
              rel="noopener noreferrer"
              className="break-words text-sm text-primary hover:underline"
            >
              {mempoolTxID}
            </a>
          </div>
        )}
      </div>
    </div>
  );
};
