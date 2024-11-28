import { Text } from "@babylonlabs-io/bbn-core-ui";
import { WalletButton } from "@babylonlabs-io/bbn-wallet-connect";

import tomo from "@/utils/wallet/icons/tomo.svg";

import { useBTCWallet } from "../../BTCWalletProvider";

export function BTCWidget() {
  const { open, connected } = useBTCWallet("tomo");

  return (
    <div className="b-sticky b-inset-x-0 b-bottom-0 b-bg-[#ffffff] b-pt-10">
      <Text className="b-mb-4">More wallets with Tomo Connect</Text>
      <WalletButton logo={tomo.src} name="Tomo Connect" onClick={open} />
    </div>
  );
}
