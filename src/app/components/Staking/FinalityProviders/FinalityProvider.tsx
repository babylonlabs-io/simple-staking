import Image from "next/image";

import { Hash } from "@/app/components/Hash/Hash";
import blue from "@/app/assets/blue-check.svg";
import { satoshiToBtc } from "@/utils/btcConversions";
import { maxDecimals } from "@/utils/maxDecimals";

interface FinalityProviderProps {
  moniker: string;
  pkHex: string;
  stakeSat: number;
  comission: string;
  onClick: () => void;
  selected: boolean;
}

export const FinalityProvider: React.FC<FinalityProviderProps> = ({
  moniker,
  pkHex,
  stakeSat,
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
      <div className="grid grid-cols-2 grid-rows-2 items-center gap-2 lg:grid-cols-stakingFinalityProviders lg:grid-rows-1">
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
        <div className="flex gap-1">
          <p className="lg:hidden">Total Delegation:</p>
          <p>{maxDecimals(satoshiToBtc(stakeSat), 8)} Signet BTC</p>
        </div>
        <div className="flex gap-1">
          <p className="lg:hidden">Comission:</p>
          {maxDecimals(Number(comission) * 100, 2)}%
        </div>
      </div>
    </div>
  );
};
