import type { BTCConfig } from "@babylonlabs-io/wallet-connector";

import { MEMPOOL_API } from "@/app/constants";
import { Network } from "@/app/types/network";
import { ClientError, ERROR_CODES } from "@/errors";

const defaultNetwork = "devnet";
export const network = process.env.NEXT_PUBLIC_NETWORK ?? defaultNetwork;

const config: Record<string, BTCConfig> = {
  mainnet: {
    coinName: "BTC",
    coinSymbol: "BTC",
    networkName: "BTC",
    mempoolApiUrl: `${MEMPOOL_API}`,
    network: Network.MAINNET,
  },
  canary: {
    coinName: "BTC",
    coinSymbol: "BTC",
    networkName: "BTC",
    mempoolApiUrl: `${MEMPOOL_API}`,
    network: Network.MAINNET,
  },
  testnet: {
    // We do not use BTC Testnet
    coinName: "Signet BTC",
    coinSymbol: "sBTC",
    networkName: "BTC signet",
    mempoolApiUrl: `${MEMPOOL_API}/signet`,
    network: Network.SIGNET,
  },
  devnet: {
    coinName: "Signet BTC",
    coinSymbol: "sBTC",
    networkName: "BTC signet",
    mempoolApiUrl: `${MEMPOOL_API}/signet`,
    network: Network.SIGNET,
  },
};

export function getNetworkConfigBTC(): BTCConfig {
  return config[network] ?? config[defaultNetwork];
}

export function validateAddress(network: Network, address: string): void {
  if (network === Network.MAINNET && !address.startsWith("bc1")) {
    throw new ClientError(
      ERROR_CODES.VALIDATION_ERROR,
      `Incorrect address prefix for ${network}. Expected address to start with 'bc1'.`,
    );
  } else if (
    [Network.SIGNET, Network.TESTNET].includes(network) &&
    !address.startsWith("tb1")
  ) {
    throw new ClientError(
      ERROR_CODES.VALIDATION_ERROR,
      "Incorrect address prefix for Testnet / Signet. Expected address to start with 'tb1'.",
    );
  } else if (
    ![Network.MAINNET, Network.SIGNET, Network.TESTNET].includes(network)
  ) {
    throw new ClientError(
      ERROR_CODES.VALIDATION_ERROR,
      `Unsupported network: ${network}. Please provide a valid network.`,
    );
  }
}
