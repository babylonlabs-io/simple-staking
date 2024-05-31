import Image from "next/image";

import { network } from "@/config/network.config";
import { Network } from "@/utils/wallet/wallet_provider";

import testnetIcon from "./testnet-icon.png";

// This component can also be used rendering based on the network type
interface NetworkBadgeProps {}

export const NetworkBadge: React.FC<NetworkBadgeProps> = () => {
  return (
    <div className="absolute left-2 top-[6rem]">
      {[Network.SIGNET, Network.TESTNET].includes(network) && (
        <>
          <Image src={testnetIcon} alt="Testnet" className="w-[10rem]" />
          {/* 
            currently the text is absolutely positioned
            since the image has a shadow 
          */}
          <p className="absolute left-4 top-[4rem] text-sm dark:text-neutral-content">
            Testnet
          </p>
        </>
      )}
    </div>
  );
};
