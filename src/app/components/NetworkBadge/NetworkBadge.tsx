import Image from "next/image";
import { twJoin } from "tailwind-merge";

import { Network } from "@/app/types/network";
import { network } from "@/config/network/btc";

import testnetIcon from "./testnet-icon.png";

export const NetworkBadge = () => {
  return (
    <div className={twJoin(`absolute left-2 top-7`)}>
      {[Network.SIGNET, Network.TESTNET].includes(network) && (
        <>
          <Image
            src={testnetIcon}
            alt="Testnet"
            className="w-[4rem] md:w-[7rem]"
          />
          {/*
            currently the text is absolutely positioned
            since the image has a shadow
          */}
          <p className="absolute left-1 top-[1rem] md:top-[2rem] text-sm text-secondary-contrast">
            Testnet
          </p>
        </>
      )}
    </div>
  );
};
