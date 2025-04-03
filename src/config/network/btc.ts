import type { BTCConfig } from "@babylonlabs-io/wallet-connector";

import { MEMPOOL_API } from "@/app/constants";
import { Network } from "@/app/types/network";

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
