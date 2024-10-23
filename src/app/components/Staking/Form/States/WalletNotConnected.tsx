import Image from "next/image";

import { useBTCWallet } from "@/app/context/wallet/BTCWalletProvider";

import connectIcon from "./connect-icon.svg";
import walletIcon from "./wallet-icon.svg";

export const WalletNotConnected = () => {
  const { open } = useBTCWallet();

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex flex-1 flex-col items-center justify-center gap-2 py-12">
        <div className="rounded-full bg-base-200 p-4">
          <Image src={walletIcon} alt="Wallet" width={32} height={32} />
        </div>
        <h3 className="font-bold">Connect wallet</h3>
        <p className="text-center text-sm font-light dark:text-neutral-content">
          Please connect wallet to start staking
        </p>
      </div>
      <button className="btn-primary btn" onClick={open}>
        <Image src={connectIcon} alt="Connect wallet" />
        Connect wallet
      </button>
    </div>
  );
};
