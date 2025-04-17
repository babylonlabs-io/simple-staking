import { Button, Heading, Text } from "@babylonlabs-io/core-ui";
import Image from "next/image";

import { useBTCWallet } from "@/app/context/wallet/BTCWalletProvider";
import { getNetworkConfigBTC } from "@/config/network/btc";

import walletIcon from "./wallet-icon-secure.svg";

export const WalletNotConnected = () => {
  const { open } = useBTCWallet();
  const { coinName } = getNetworkConfigBTC();

  return (
    <div className="flex flex-1 flex-row items-center justify-center gap-8">
      <div className="rotate-12">
        <Image src={walletIcon} alt="Wallet" width={185} height={144} />
      </div>

      <div className="text-start gap-4 flex flex-col items-start">
        <Heading variant="h5" className="text-accent-primary text-2xl mb-2">
          Connect wallets to start staking
        </Heading>
        <Text
          variant="body1"
          className="text-start text-base text-accent-secondary p-0"
        >
          To start staking your {coinName} first connect wallets then select a
          Finality Provider
        </Text>
        <Button variant="outlined" onClick={open} className="text-primary-dark">
          Connect Wallets
        </Button>
      </div>
    </div>
  );
};
