import Image from "next/image";

import { useBTCWallet } from "@/app/context/wallet/BTCWalletProvider";
import { getNetworkConfigBTC } from "@/config/network/btc";
import { Button } from "@/ui";

import walletIcon from "./wallet-icon.svg";

export const WalletNotConnected = () => {
  const { open } = useBTCWallet();
  const { coinName } = getNetworkConfigBTC();

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-8">
      <div className="rotate-12">
        <Image src={walletIcon} alt="Wallet" width={120} height={122} />
      </div>

      <div className="text-center">
        <h4 className="mb-2 font-sans font-bold text-h5">
          Connect wallets to start staking
        </h4>

        <p className="font-medium text-callout text-itemSecondaryDefault text-balance">
          To start staking your {coinName} first connect wallets then select a
          Finality Provider
        </p>
      </div>

      <Button application variant="outline" onClick={open}>
        Connect Wallets
      </Button>
    </div>
  );
};
