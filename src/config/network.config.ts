import { Network } from "@/utils/wallet/wallet_provider";

const network = process.env.NEXT_PUBLIC_NETWORK as Network;

interface NetworkConfig {
  coinName: string;
  coinSymbol: string;
  explorerUrl: string;
}

const mainnetConfig: NetworkConfig = {
  coinName: "BTC",
  coinSymbol: "BTC",
  explorerUrl: `${process.env.NEXT_PUBLIC_MEMPOOL_API}`,
};

const testnetConfig: NetworkConfig = {
  coinName: "Signet BTC",
  coinSymbol: "sBTC",
  explorerUrl: `${process.env.NEXT_PUBLIC_MEMPOOL_API}/signet`,
};

const config: Record<string, NetworkConfig> = {
  mainnet: mainnetConfig,
  testnet: testnetConfig,
};

export function getNetworkConfig(): NetworkConfig {
  switch (network) {
    case Network.MAINNET:
      return config.mainnet;
    default:
      return config.testnet;
  }
}