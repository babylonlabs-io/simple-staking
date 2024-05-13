import { FaBitcoin } from "react-icons/fa";
import { AiOutlineInfoCircle } from "react-icons/ai";
import { Tooltip } from "react-tooltip";
import Image from "next/image";

import { Hash } from "../Hash/Hash";
import blue from "@/app/assets/blue-check.svg";

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

  const generateFpNoInfoTooltip = (defaultValue: string, tooltip: string) => {
    return (
      <div className="flex items-center gap-2">
        <p>{defaultValue}</p>
        <span
          className="cursor-pointer text-xs"
          data-tooltip-id="tooltip-missing"
          data-tooltip-content={tooltip}
          data-tooltip-place="top"
        >
          <AiOutlineInfoCircle />
        </span>
      </div>
    );
  };

  return (
    <div className="card grid grid-cols-2 gap-2 border bg-base-300 p-4 text-sm dark:border-0 dark:bg-base-200 lg:grid-cols-finalityProviders">
      <div className="flex gap-2">
        <FaBitcoin size={16} className="mt-1 text-primary" />
        <div className="flex flex-col">
          <div>
            {moniker ? (
              <div className="flex items-center gap-1">
                <p>{moniker}</p>
                <Image src={blue} alt="verified" />
              </div>
            ) : (
              generateFpNoInfoTooltip(
                "-",
                "Finality Provider has not provided additional information",
              )
            )}
          </div>
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
            0
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
          0
        )}
      </div>
      <Tooltip id="tooltip-missing" />
    </div>
  );
};
