import { Network } from "@/utils/wallet/wallet_provider";

const network = process.env.NEXT_PUBLIC_NETWORK as Network;

interface NetworkConfig {
  coinName: string;
  coinSymbol: string;
  networkName: string;
  mempoolApiUrl: string;
}

const mainnetConfig: NetworkConfig = {
  coinName: "BTC",
  coinSymbol: "BTC",
  networkName: "BTC",
  mempoolApiUrl: `${process.env.NEXT_PUBLIC_MEMPOOL_API}`,
};

const signetConfig: NetworkConfig = {
  coinName: "Signet BTC",
  coinSymbol: "sBTC",
  networkName: "BTC signet",
  mempoolApiUrl: `${process.env.NEXT_PUBLIC_MEMPOOL_API}/signet`,
};

const config: Record<string, NetworkConfig> = {
  mainnet: mainnetConfig,
  testnet: signetConfig,
};

export function getNetworkConfig(): NetworkConfig {
  switch (network) {
    case Network.MAINNET:
      return config.mainnet;
    case Network.REGTEST:
    case Network.SIGNET:
    case Network.TESTNET:
      return config.testnet;
    default:
      throw new Error(`Unsupported network: ${network}`);
  }
}

export const isMainnet = network === Network.MAINNET;

export function validAddress(network: Network, address: string): void {
  if (isMainnet && !address.startsWith("bc1")) {
    throw new Error(
      "Incorrect address prefix for Mainnet. Expected address to start with 'bc1'.",
    );
  } else if (!isMainnet && !address.startsWith("tb1")) {
    throw new Error(
      "Incorrect address prefix for Testnet. Expected address to start with 'tb1'.",
    );
  } else if (!isMainnet && ![Network.REGTEST, Network.SIGNET, Network.TESTNET].includes(network)) {
    throw new Error(
      `Unsupported network: ${network}. Please provide a valid network.`,
    );
  }
}
