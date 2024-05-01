import { FinalityProvider as FinalityProviderInterface } from "@/app/api/getFinalityProviders";

import { trim } from "@/utils/trim";
import { Hash } from "../Hash/Hash";

interface FinalityProviderProps {
  moniker: string;
  pkHex: string;
  stake: number;
  comission: string;
  onClick: () => void;
  finalityProvider?: FinalityProviderInterface | undefined;
}

export const FinalityProvider: React.FC<FinalityProviderProps> = ({
  moniker,
  pkHex,
  stake,
  comission,
  onClick,
  finalityProvider,
}) => {
  return (
    <div
      className={`card relative cursor-pointer border bg-base-300 p-4 text-sm transition-shadow hover:shadow-md dark:border-transparent dark:bg-base-200 ${pkHex === finalityProvider?.btc_pk ? "fp-selected" : ""}`}
      onClick={onClick}
    >
      <div className="grid-cols-stakingFinalityProviders grid grid-rows-1 items-center gap-2">
        <div>{moniker}</div>
        <Hash value={pkHex} address small noFade />
        <p>{stake / 1e8} Signet BTC</p>
        <div>{Number(comission) * 100}%</div>
      </div>
    </div>
  );
};
