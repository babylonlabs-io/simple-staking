import { Network } from "@/utils/wallet/btc_wallet_provider";

export const network =
  (process.env.NEXT_PUBLIC_NETWORK as Network) || Network.SIGNET;

interface NetworkConfig {
  coinName: string;
  coinSymbol: string;
  networkName: string;
  mempoolApiUrl: string;
  network: Network;
}

const mainnetConfig: NetworkConfig = {
  coinName: "BTC",
  coinSymbol: "BTC",
  networkName: "BTC",
  mempoolApiUrl: `${process.env.NEXT_PUBLIC_MEMPOOL_API}`,
  network: Network.MAINNET,
};

const signetConfig: NetworkConfig = {
  coinName: "Signet BTC",
  coinSymbol: "sBTC",
  networkName: "BTC signet",
  mempoolApiUrl: `${process.env.NEXT_PUBLIC_MEMPOOL_API}/signet`,
  network: Network.SIGNET,
};

const testnetConfig: NetworkConfig = {
  coinName: "Testnet BTC",
  coinSymbol: "tBTC",
  networkName: "BTC testnet",
  mempoolApiUrl: `${process.env.NEXT_PUBLIC_MEMPOOL_API}/testnet`,
  network: Network.TESTNET,
};

const config: Record<string, NetworkConfig> = {
  mainnet: mainnetConfig,
  signet: signetConfig,
  testnet: testnetConfig,
};

export function getNetworkConfig(): NetworkConfig {
  switch (network) {
    case Network.MAINNET:
      return config.mainnet;
    case Network.SIGNET:
      return config.signet;
    case Network.TESTNET:
      return config.testnet;
    default:
      return config.signet;
  }
}
