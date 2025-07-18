import type { BTCConfig } from "@babylonlabs-io/wallet-connector";

import bitcoinIcon from "@/ui/legacy/assets/bitcoin.png";
import signetBitcoinIcon from "@/ui/legacy/assets/signet_bitcoin.svg";
import { MEMPOOL_API } from "@/ui/legacy/constants";
import { Network } from "@/ui/legacy/types/network";

const defaultNetwork = "devnet";
export const network = process.env.NEXT_PUBLIC_NETWORK ?? defaultNetwork;

type Config = BTCConfig & { icon: string; name: string; displayUSD: boolean };

const config: Record<string, Config> = {
  mainnet: {
    name: "Bitcoin",
    coinName: "BTC",
    coinSymbol: "BTC",
    networkName: "BTC",
    mempoolApiUrl: `${MEMPOOL_API}`,
    network: Network.MAINNET,
    icon: bitcoinIcon,
    displayUSD: true,
  },
  canary: {
    name: "Bitcoin",
    coinName: "BTC",
    coinSymbol: "BTC",
    networkName: "BTC",
    mempoolApiUrl: `${MEMPOOL_API}`,
    network: Network.MAINNET,
    icon: bitcoinIcon,
    displayUSD: true,
  },
  testnet: {
    // We do not use BTC Testnet
    name: "Signet Bitcoin",
    coinName: "Signet BTC",
    coinSymbol: "sBTC",
    networkName: "BTC signet",
    mempoolApiUrl: `${MEMPOOL_API}/signet`,
    network: Network.SIGNET,
    icon: signetBitcoinIcon,
    displayUSD: false,
  },
  devnet: {
    name: "Signet Bitcoin",
    coinName: "Signet BTC",
    coinSymbol: "sBTC",
    networkName: "BTC signet",
    mempoolApiUrl: `${MEMPOOL_API}/signet`,
    network: Network.SIGNET,
    icon: signetBitcoinIcon,
    displayUSD: false,
  },
};

export function getNetworkConfigBTC(): Config {
  return config[network] ?? config[defaultNetwork];
}
