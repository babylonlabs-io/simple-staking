import Image from "next/image";

import babylon from "@/app/assets/babylon-genesis.png";
import cosmos from "@/app/assets/cosmos.png";
import ethereum from "@/app/assets/ethereum.png";
import sui from "@/app/assets/sui.png";
import { KeybaseImage } from "@/app/components/KeybaseImage/KeybaseImage";
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
        return babylon;
      case "cosmos":
        return cosmos;
      case "ethereum":
        return ethereum;
      case "sui":
        return sui;
      default:
        return babylon;
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
        return "BSN";
    }
  };

  return (
    <div className="flex flex-row justify-between items-center">
      <div className="h-10 flex flex-row gap-2">
        <KeybaseImage
          identity={provider.description?.identity}
          moniker={provider.description?.moniker}
          size="large"
        />
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
