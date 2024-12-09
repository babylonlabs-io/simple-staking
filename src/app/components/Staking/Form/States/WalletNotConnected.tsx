import { Button, Heading, Text } from "@babylonlabs-io/bbn-core-ui";
import Image from "next/image";

import { useBTCWallet } from "@/app/context/wallet/BTCWalletProvider";
import { getNetworkConfig } from "@/config/network.config";

import walletIcon from "./wallet-icon.svg";

export const WalletNotConnected = () => {
  const { open } = useBTCWallet();
  const { coinName } = getNetworkConfig();

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex flex-1 flex-col items-center justify-center gap-8">
        <div className="rotate-12">
          <Image src={walletIcon} alt="Wallet" width={120} height={122} />
        </div>
        <div className="flex flex-col gap-2 justify-center items-center self-stretch">
          <Heading variant="h5" className="text-primary-dark text-2xl">
            Connect wallet to start staking
          </Heading>
          <Text
            variant="body1"
            className="text-center text-base text-primary-light p-0"
          >
            To start staking your {coinName} first connect wallets then select a
            Finality Provider
          </Text>
        </div>
        <Button variant="outlined" onClick={open} className="text-primary-dark">
          Connect wallet
        </Button>
      </div>
    </div>
  );
};
