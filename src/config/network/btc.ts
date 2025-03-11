import { MEMPOOL_API } from "@/app/constants";
import { Network } from "@/app/types/network";

export const network =
  (process.env.NEXT_PUBLIC_NETWORK as Network) || Network.SIGNET;

const mainnetConfig = {
  coinName: "BTC",
  coinSymbol: "BTC",
  networkName: "BTC",
  mempoolApiUrl: `${MEMPOOL_API}`,
  network: Network.MAINNET,
};

const mockConfig = {
  coinName: "BTC",
  coinSymbol: "BTC",
  networkName: "BTC",
  mempoolApiUrl: `${MEMPOOL_API}`,
  network: Network.MOCK_MAINNET,
};

const canaryConfig = {
  coinName: "BTC",
  coinSymbol: "BTC",
  networkName: "BTC",
  mempoolApiUrl: `${MEMPOOL_API}`,
  network: Network.CANARY,
};

const signetConfig = {
  coinName: "Signet BTC",
  coinSymbol: "sBTC",
  networkName: "BTC signet",
  mempoolApiUrl: `${MEMPOOL_API}/signet`,
  network: Network.SIGNET,
};

const testnetConfig = {
  coinName: "Testnet BTC",
  coinSymbol: "tBTC",
  networkName: "BTC testnet",
  mempoolApiUrl: `${MEMPOOL_API}/testnet`,
  network: Network.TESTNET,
};

const config = {
  mainnet: mainnetConfig,
  signet: signetConfig,
  testnet: testnetConfig,
  canary: canaryConfig,
  mock: mockConfig,
};

export function getNetworkConfigBTC(): any {
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
    case Network.MOCK_MAINNET:
      return config.mock;
    default:
      return config.signet;
  }
}

export function validateAddress(network: Network, address: string): void {
  if (
    (network === Network.MAINNET || network === Network.MOCK_MAINNET) &&
    !address.startsWith("bc1")
  ) {
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
      Network.MOCK_MAINNET,
    ].includes(network)
  ) {
    // wallet error
    throw new Error(
      `Unsupported network: ${network}. Please provide a valid network.`,
    );
  }
}
