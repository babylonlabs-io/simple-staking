import type { BBNConfig } from "@babylonlabs-io/wallet-connector";

import { Network } from "@/app/types/network";

import { bbnCanary } from "./bbn/canary";
import { bbnDevnet } from "./bbn/devnet";
import { bbnMock } from "./bbn/mock";
import { bbnTestnet } from "./bbn/testnet";

export const network =
  (process.env.NEXT_PUBLIC_NETWORK as Network) || Network.SIGNET;

const mockConfig: BBNConfig = {
  chainId: bbnMock.chainId,
  rpc: bbnMock.rpc,
  chainData: bbnMock,
  networkName: "BABY",
  networkFullName: "Babylon Chain",
  coinSymbol: "BABY",
};

const mainnetConfig: BBNConfig = {
  chainId: bbnTestnet.chainId,
  rpc: bbnTestnet.rpc,
  chainData: bbnTestnet,
  networkName: "BABY",
  networkFullName: "Babylon Chain",
  coinSymbol: "BABY",
};

const canaryConfig: BBNConfig = {
  chainId: bbnCanary.chainId,
  rpc: bbnCanary.rpc,
  chainData: bbnCanary,
  networkName: "BABY",
  networkFullName: "Babylon Chain",
  coinSymbol: "BABY",
};

const signetConfig: BBNConfig = {
  chainId: bbnDevnet.chainId,
  rpc: bbnDevnet.rpc,
  chainData: bbnDevnet,
  networkName: "Testnet BABY",
  networkFullName: "Testnet Babylon Chain",
  coinSymbol: "tBABY",
};

const testnetConfig: BBNConfig = {
  chainId: bbnTestnet.chainId,
  rpc: bbnTestnet.rpc,
  chainData: bbnTestnet,
  networkName: "Testnet BABY",
  networkFullName: "Testnet Babylon Chain",
  coinSymbol: "tBABY",
};

const config: Record<string, BBNConfig> = {
  mainnet: mainnetConfig,
  canary: canaryConfig,
  signet: signetConfig,
  testnet: testnetConfig,
  mock: mockConfig,
};

export function getNetworkConfigBBN(): BBNConfig {
  switch (network) {
    case Network.MAINNET:
      return config.mainnet;
    case Network.CANARY:
      return config.canary;
    case Network.SIGNET:
      return config.signet;
    case Network.TESTNET:
      return config.testnet;
    case Network.MOCK_MAINNET:
      return config.mock;
    default:
      return config.signet;
  }
}
