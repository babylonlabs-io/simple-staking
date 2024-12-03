import { Text } from "@babylonlabs-io/bbn-core-ui";
import {
  useWidgetState,
  WalletButton,
} from "@babylonlabs-io/bbn-wallet-connect";
import { useTomoModalControl } from "@tomo-inc/wallet-connect-sdk";
import { useCallback } from "react";

import logo from "./tomo.png";

const CHAINS = {
  bitcoin: "BTC",
  cosmos: "BBN",
};

export const ConnectButton = ({
  chainName,
}: {
  chainName: "bitcoin" | "cosmos";
}) => {
  const tomoModal = useTomoModalControl();
  const { displayWallets } = useWidgetState();

  const open = useCallback(async () => {
    const result = await tomoModal.open(chainName);

    if (!result) {
      displayWallets?.(CHAINS[chainName]);
    }
  }, [tomoModal, chainName, displayWallets]);

  return (
    <div className="sticky inset-x-0 bottom-0 bg-[#ffffff] pt-10">
      <Text className="mb-4">More wallets with Tomo Connect</Text>
      <WalletButton logo={logo.src} name="Tomo Connect" onClick={open} />
    </div>
  );
};
