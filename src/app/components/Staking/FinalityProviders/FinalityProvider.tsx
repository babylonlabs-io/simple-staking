import Image from "next/image";
import { AiOutlineInfoCircle } from "react-icons/ai";
import { Tooltip } from "react-tooltip";

import blue from "@/app/assets/blue-check.svg";
import { Hash } from "@/app/components/Hash/Hash";
import { getNetworkConfig } from "@/config/network.config";
import { satoshiToBtc } from "@/utils/btcConversions";
import { maxDecimals } from "@/utils/maxDecimals";

interface FinalityProviderProps {
  moniker: string;
  pkHex: string;
  stakeSat: number;
  commission: string;
  onClick: () => void;
  selected: boolean;
}

export const FinalityProvider: React.FC<FinalityProviderProps> = ({
  moniker,
  pkHex,
  stakeSat,
  commission,
  onClick,
  selected,
}) => {
  const generalStyles =
    "card relative cursor-pointer border bg-base-300 p-4 text-sm transition-shadow hover:shadow-md dark:border-transparent dark:bg-base-200";

  const { coinName } = getNetworkConfig();

  const finalityProviderHasData = moniker && pkHex && commission;

  const handleClick = () => {
    if (finalityProviderHasData) {
      onClick();
    }
  };

  return (
    <div
      className={`
        ${generalStyles}
        ${selected ? "fp-selected" : ""}
        ${finalityProviderHasData ? "" : "opacity-50 pointer-events-none"}
        `}
      onClick={handleClick}
    >
      <div className="grid grid-cols-stakingFinalityProvidersMobile grid-rows-2 items-center gap-2 lg:grid-cols-stakingFinalityProvidersDesktop lg:grid-rows-1">
        <div>
          {finalityProviderHasData ? (
            <div className="flex items-center gap-1 justify-start">
              <Image src={blue} alt="verified" />
              <p>{moniker}</p>
            </div>
          ) : (
            <div className="flex items-center gap-1 justify-start">
              <span
                className="cursor-pointer text-xs text-error"
                data-tooltip-id="tooltip-missing-fp"
                data-tooltip-content="This finality provider did not provide any information."
                data-tooltip-place="top"
              >
                <AiOutlineInfoCircle size={16} />
              </span>
              <Tooltip id="tooltip-missing-fp" />
              <span>No data provided</span>
            </div>
          )}
        </div>
        <div className="flex justify-end lg:justify-start">
          <Hash value={pkHex} address small noFade />
        </div>
        <div className="flex items-center gap-1">
          <p className="hidden sm:flex lg:hidden">Delegation:</p>
          <p>
            {maxDecimals(satoshiToBtc(stakeSat), 8)} {coinName}
          </p>
          <span
            className="inline-flex cursor-pointer text-xs sm:hidden"
            data-tooltip-id={`tooltip-delegation-${pkHex}`}
            data-tooltip-content="Total delegation"
            data-tooltip-place="right"
          >
            <AiOutlineInfoCircle />
          </span>
          <Tooltip id={`tooltip-delegation-${pkHex}`} />
        </div>
        <div className="flex items-center justify-end gap-1 lg:justify-start">
          <p className="hidden sm:flex lg:hidden">Commission:</p>
          {finalityProviderHasData
            ? `${maxDecimals(Number(commission) * 100, 2)}%`
            : "-"}
          <span
            className="inline-flex cursor-pointer text-xs sm:hidden"
            data-tooltip-id={`tooltip-delegation-${pkHex}`}
            data-tooltip-content="Total delegation"
            data-tooltip-place="top"
          >
            <AiOutlineInfoCircle />
          </span>
          <Tooltip id={`tooltip-delegation-${pkHex}`} />
        </div>
      </div>
    </div>
  );
};
