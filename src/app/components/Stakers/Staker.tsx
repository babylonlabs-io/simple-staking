import { Hash } from "../Hash/Hash";

interface StakerProps {
  pkHex: string;
  delegations: number;
  activeTVL: number;
}

export const Staker: React.FC<StakerProps> = ({
  pkHex,
  delegations,
  activeTVL,
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
          <p className="text-xs dark:text-neutral-content lg:hidden">
            Delegations
          </p>
          <p>{delegations}</p>
        </div>
        <div>
          <p className="text-xs dark:text-neutral-content lg:hidden">Stake</p>
          <p>{+(activeTVL / 1e8).toFixed(6)} Signet BTC</p>
        </div>
      </div>
    </div>
  );
};
