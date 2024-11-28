import Image from "next/image";
import { AiOutlineInfoCircle } from "react-icons/ai";
import { FiExternalLink } from "react-icons/fi";
import { Tooltip } from "react-tooltip";
import { twJoin } from "tailwind-merge";

import blue from "@/app/assets/blue-check.svg";
import { Hash } from "@/app/components/Hash/Hash";
import { FinalityProviderState } from "@/app/types/finalityProviders";
import { getNetworkConfig } from "@/config/network.config";
import { satoshiToBtc } from "@/utils/btc";
import { maxDecimals } from "@/utils/maxDecimals";

interface FinalityProviderProps {
  moniker: string;
  pkHex: string;
  state: FinalityProviderState;
  stakeSat: number;
  commission: string;
  onClick: () => void;
  selected: boolean;
  website?: string;
}
const stateMap = {
  FINALITY_PROVIDER_STATUS_INACTIVE: "Inactive",
  FINALITY_PROVIDER_STATUS_ACTIVE: "Active",
  FINALITY_PROVIDER_STATUS_JAILED: "Jailed",
  FINALITY_PROVIDER_STATUS_SLASHED: "Slashed",
} as const;

export const FinalityProvider: React.FC<FinalityProviderProps> = ({
  moniker,
  state,
  pkHex,
  stakeSat,
  commission,
  onClick,
  selected,
  website,
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
      className={twJoin(
        generalStyles,
        selected ? "fp-selected" : "",
        finalityProviderHasData ? "" : "opacity-50 pointer-events-none",
      )}
      onClick={handleClick}
    >
      <div className="grid grid-cols-stakingFinalityProvidersMobile grid-rows-2 items-center gap-2 lg:grid-cols-stakingFinalityProvidersDesktop lg:grid-rows-1">
        <div>
          {finalityProviderHasData ? (
            <div className="flex items-center gap-1 justify-start">
              <Image src={blue} alt="verified" />
              <p>
                {moniker}
                {website && (
                  <a
                    href={website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary inline-flex ml-1 relative top-[1px]"
                  >
                    <FiExternalLink />
                  </a>
                )}
              </p>
            </div>
          ) : (
            <div className="flex items-center gap-1 justify-start">
              <span
                className="cursor-pointer text-xs text-error pointer-events-auto"
                data-tooltip-id="tooltip-missing-fp"
                data-tooltip-content="This finality provider did not provide any information."
                data-tooltip-place="top"
              >
                <AiOutlineInfoCircle size={16} />
              </span>
              <Tooltip id="tooltip-missing-fp" className="tooltip-wrap" />
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
          <Tooltip
            id={`tooltip-delegation-${pkHex}`}
            className="tooltip-wrap"
          />
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
          <Tooltip
            id={`tooltip-delegation-${pkHex}`}
            className="tooltip-wrap"
          />
        </div>
        <div className="flex justify-start gap-1 capitalize lg:justify-end">
          <span className="lg:hidden">Status:</span> {stateMap[state]}
        </div>
      </div>
    </div>
  );
};
