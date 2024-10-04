import Image from "next/image";
import { twJoin } from "tailwind-merge";

import { useWallet } from "@/app/context/wallet/WalletProvider";
import { network } from "@/config/network.config";
import { Network } from "@/utils/wallet/wallet_provider";

import testnetIcon from "./testnet-icon.png";

export const NetworkBadge = () => {
  const { walletProvider } = useWallet();

  return (
    <div
      className={twJoin(
        `absolute left-2`,
        Boolean(walletProvider)
          ? "top-40 md:top-24 lg:top-32"
          : "top-24 md:top-24 lg:top-32",
      )}
    >
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
