import Image from "next/image";
import { twJoin } from "tailwind-merge";

import { useBTCWallet } from "@/app/context/wallet/BTCWalletProvider";
import { network } from "@/config/network.config";
import { Network } from "@/utils/wallet/btc_wallet_provider";

import testnetIcon from "./testnet-icon.png";

export const NetworkBadge = () => {
  const { connected } = useBTCWallet();

  return (
    <div
      className={twJoin(
        `absolute left-2`,
        connected ? "top-40 md:top-24 lg:top-32" : "top-24 md:top-24 lg:top-32",
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
