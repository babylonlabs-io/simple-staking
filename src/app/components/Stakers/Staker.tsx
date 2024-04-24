import { Hash } from "../Hash/Hash";

interface StakerProps {
  pkHex: string;
  delegations: number;
  stake: number;
}

export const Staker: React.FC<StakerProps> = ({
  pkHex,
  delegations,
  stake,
}) => {
  return (
    <div className="card border bg-base-300 p-4 text-sm dark:border-0 dark:bg-base-200">
      <div className="mb-2 block lg:hidden">
        <Hash value={pkHex} address small noFade />
      </div>
      <div className="grid grid-cols-2 grid-rows-1 gap-2 lg:grid-cols-3">
        <div className="hidden lg:block">
          <Hash value={pkHex} address small noFade />
        </div>
        <div>
          <p className="dark:text-neutral-content lg:hidden">Delegations</p>
          <p>{delegations}</p>
        </div>
        <div>
          <p className="dark:text-neutral-content lg:hidden">Stake</p>
          <p>{stake / 1e8} Signet BTC</p>
        </div>
      </div>
    </div>
  );
};
