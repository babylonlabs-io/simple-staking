import type { BTCConfig } from "@babylonlabs-io/wallet-connector";

import bitcoinIcon from "@/ui/common/assets/bitcoin.png";
import signetBitcoinIcon from "@/ui/common/assets/signet_bitcoin.svg";
import { MEMPOOL_API } from "@/ui/common/constants";
import { ClientError, ERROR_CODES } from "@/ui/common/errors";
import { Network } from "@/ui/common/types/network";

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
