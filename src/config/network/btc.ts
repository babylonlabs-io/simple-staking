import type { BTCConfig } from "@babylonlabs-io/bbn-wallet-connect";

import { MEMPOOL_API } from "@/app/constants";
import { Network } from "@/app/types/network";

export const network =
  (process.env.NEXT_PUBLIC_NETWORK as Network) || Network.SIGNET;

const mainnetConfig: BTCConfig = {
  coinName: "BTC",
  coinSymbol: "BTC",
  networkName: "BTC",
  mempoolApiUrl: `${MEMPOOL_API}`,
  network: Network.MAINNET,
};

const canaryConfig: BTCConfig = {
  coinName: "BTC",
  coinSymbol: "BTC",
  networkName: "BTC",
  mempoolApiUrl: `${MEMPOOL_API}`,
  network: Network.CANARY,
};

const signetConfig: BTCConfig = {
  coinName: "Signet BTC",
  coinSymbol: "sBTC",
  networkName: "BTC signet",
  mempoolApiUrl: `${MEMPOOL_API}/signet`,
  network: Network.SIGNET,
};

const testnetConfig: BTCConfig = {
  coinName: "Testnet BTC",
  coinSymbol: "tBTC",
  networkName: "BTC testnet",
  mempoolApiUrl: `${MEMPOOL_API}/testnet`,
  network: Network.TESTNET,
};

const config: Record<string, BTCConfig> = {
  mainnet: mainnetConfig,
  signet: signetConfig,
  testnet: testnetConfig,
  canary: canaryConfig,
};

export function getNetworkConfigBTC(): BTCConfig {
  switch (network) {
    case Network.MAINNET:
      return config.mainnet;
    case Network.CANARY:
      return config.canary;
    case Network.SIGNET:
      return config.signet;
    // we do not use Testnet
    case Network.TESTNET:
      return config.signet;
    default:
      return config.signet;
  }
}

export function validateAddress(network: Network, address: string): void {
  if (network === Network.MAINNET && !address.startsWith("bc1")) {
    // wallet error
    throw new Error(
      "Incorrect address prefix for Mainnet. Expected address to start with 'bc1'.",
    );
  } else if (network === Network.CANARY && !address.startsWith("bc1")) {
    // wallet error
    throw new Error(
      "Incorrect address prefix for Canary. Expected address to start with 'bc1'.",
    );
  } else if (
    [Network.SIGNET, Network.TESTNET].includes(network) &&
    !address.startsWith("tb1")
  ) {
    // wallet error
    throw new Error(
      "Incorrect address prefix for Testnet / Signet. Expected address to start with 'tb1'.",
    );
  } else if (
    ![
      Network.MAINNET,
      Network.SIGNET,
      Network.TESTNET,
      Network.CANARY,
    ].includes(network)
  ) {
    // wallet error
    throw new Error(
      `Unsupported network: ${network}. Please provide a valid network.`,
    );
  }
}
