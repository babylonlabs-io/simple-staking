import { FaBitcoin } from "react-icons/fa";

import { Hash } from "../Hash/Hash";

interface FinalityProviderProps {
  pkHex: string;
  delegations: number;
  stake: number;
  moniker?: string;
  totalActiveTVL?: number;
}

export const FinalityProvider: React.FC<FinalityProviderProps> = ({
  pkHex,
  delegations,
  stake,
  moniker,
  totalActiveTVL,
}) => {
  const percentage = totalActiveTVL
    ? `${Math.round((stake / totalActiveTVL) * 100)}%`
    : "-";
  return (
    <div className="card grid grid-cols-2 gap-2 border bg-base-300 p-4 text-sm dark:border-0 dark:bg-base-200 lg:grid-cols-finalityProviders">
      <div className="flex gap-2">
        <FaBitcoin size={16} className="mt-1 text-primary" />
        <div className="flex flex-col">
          <p>{moniker || "-"}</p>
          <Hash value={pkHex} address small />
        </div>
      </div>
      <div>
        <p>{delegations}</p>
        <div className="flex gap-1 lg:hidden">
          {stake ? (
            <>
              <p>{+(stake / 1e8).toFixed(6)} Signet BTC</p>
              <p className="dark:text-neutral-content">{percentage}</p>
            </>
          ) : (
            <p>-</p>
          )}
        </div>
      </div>
      <div className="hidden gap-1 lg:flex">
        {stake ? (
          <>
            <p>{+(stake / 1e8).toFixed(6)} Signet BTC</p>
            <p className="dark:text-neutral-content">{percentage}</p>
          </>
        ) : (
          <p>-</p>
        )}
      </div>
    </div>
  );
};
