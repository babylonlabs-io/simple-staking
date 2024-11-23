import { useContext } from "react";

import { useWalletConnector, WalletConnectorName } from "./ConnectorProvider";
import { BTCWalletContext as NativeBTCWalletContext } from "./native";
import { BTCWalletContext as TomoBTcWalletContext } from "./tomo";
import { BTCWalletContext } from "./types";

const BTCProviders = {
  tomo: TomoBTcWalletContext,
  native: NativeBTCWalletContext,
} as const;

export function useBTCWallet(
  connector?: WalletConnectorName,
): BTCWalletContext {
  const { BTC } = useWalletConnector();

  return useContext(BTCProviders[connector ?? BTC]);
}
