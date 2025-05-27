import Image from "next/image";

import { chainLogos } from "@/app/assets/chains";
import { trim } from "@/utils/trim";

export const FinalityProviderItem = ({
  provider,
  chainType,
  onRemove,
}: {
  provider: any;
  chainType: string;
  onRemove: () => void;
}) => {
  const getChainLogo = () => {
    switch (chainType) {
      case "babylon":
        return chainLogos.babylon;
      case "cosmos":
        return chainLogos.cosmos;
      case "ethereum":
        return chainLogos.ethereum;
      case "sui":
        return chainLogos.sui;
      default:
        return chainLogos.placeholder;
    }
  };

  const getChainName = () => {
    switch (chainType) {
      case "babylon":
        return "Babylon Genesis";
      case "cosmos":
        return "Cosmos";
      case "ethereum":
        return "Ethereum";
      case "sui":
        return "Sui";
      default:
        return "Unknown Chain";
    }
  };

  return (
    <div className="flex flex-row justify-between items-center">
      <div className="h-10 flex flex-row gap-2">
        {/* Replace with KeybaseImage */}
        <div
          className={`w-10 h-10 text-sm flex items-center justify-center rounded-full bg-secondary-main text-accent-contrast`}
        >
          {provider.description?.moniker
            ? provider.description?.moniker[0].toUpperCase()
            : "?"}
        </div>
        <div>
          <div className="flex flex-row gap-1 items-center">
            <Image
              src={getChainLogo()}
              alt={getChainName()}
              className="w-4 h-4 rounded-[2px]"
            />
            <div className="text-xs text-[#387085]">{getChainName()}</div>
          </div>
          <div className="text-[#12495E]">
            {provider.description?.moniker ||
              trim(provider.btcPk, 8) ||
              "Selected FP"}
          </div>
        </div>
      </div>
      <div
        onClick={onRemove}
        className="text-[#12495E] text-xs tracking-[0.4px] bg-[#38708533] px-2 py-0.5 rounded cursor-pointer"
      >
        Remove
      </div>
    </div>
  );
};
