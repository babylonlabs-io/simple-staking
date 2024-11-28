import { useContext } from "react";

// import { CosmosWalletContext as NativeCosmosWalletContext } from "./bbn";
import { useWalletConnector, WalletConnectorName } from "./ConnectorProvider";
import { CosmosWalletContext as TomoCosmosWalletContext } from "./tomo";
import { CosmosWalletContext } from "./types";

const CosmosProviders = {
  tomo: TomoCosmosWalletContext,
  native: TomoCosmosWalletContext,
} as const;

export function useBBNWallet(
  connector?: WalletConnectorName,
): CosmosWalletContext {
  const { BBN } = useWalletConnector();

  return useContext(CosmosProviders[connector ?? BBN]);
}
