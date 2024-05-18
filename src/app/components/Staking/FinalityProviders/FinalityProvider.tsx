import Image from "next/image";

import { Hash } from "@/app/components/Hash/Hash";
import blue from "@/app/assets/blue-check.svg";

interface FinalityProviderProps {
  moniker: string;
  pkHex: string;
  stake: number;
  comission: string;
  onClick: () => void;
  selected: boolean;
}

export const FinalityProvider: React.FC<FinalityProviderProps> = ({
  moniker,
  pkHex,
  stake,
  comission,
  onClick,
  selected,
}) => {
  const generalStyles =
    "card relative cursor-pointer border bg-base-300 p-4 text-sm transition-shadow hover:shadow-md dark:border-transparent dark:bg-base-200";

  return (
    <div
      className={`${generalStyles} ${selected ? "fp-selected" : ""}`}
      onClick={onClick}
    >
      <div className="grid grid-cols-stakingFinalityProviders grid-rows-1 items-center gap-2">
        <div>
          {moniker ? (
            <div className="flex items-center gap-1">
              <p>{moniker}</p>
              <Image src={blue} alt="verified" />
            </div>
          ) : (
            "-"
          )}
        </div>
        <Hash value={pkHex} address small noFade />
        <p>{+(stake / 1e8).toFixed(6)} Signet BTC</p>
        <div>{Number(comission) * 100}%</div>
      </div>
    </div>
  );
};
