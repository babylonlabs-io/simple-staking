import type { BBNConfig } from "@babylonlabs-io/wallet-connector";

import { bbnCanary } from "./bbn/canary";
import { bbnDevnet } from "./bbn/devnet";
import { bbnMainnet } from "./bbn/mainnet";
import { bbnTestnet } from "./bbn/testnet";
import { bbnV4Devnet } from "./bbn/v4-devnet";

const defaultNetwork = "devnet";
export const network = process.env.NEXT_PUBLIC_NETWORK ?? defaultNetwork;

const config: Record<string, BBNConfig> = {
  mainnet: {
    chainId: bbnMainnet.chainId,
    rpc: bbnMainnet.rpc,
    chainData: bbnMainnet,
    networkName: "BABY",
    networkFullName: "Babylon Genesis",
    coinSymbol: "BABY",
  },
  canary: {
    chainId: bbnCanary.chainId,
    rpc: bbnCanary.rpc,
    chainData: bbnCanary,
    networkName: "BABY",
    networkFullName: "Babylon Genesis",
    coinSymbol: "BABY",
  },
  devnet: {
    chainId: bbnDevnet.chainId,
    rpc: bbnDevnet.rpc,
    chainData: bbnDevnet,
    networkName: "Testnet BABY",
    networkFullName: "Testnet Babylon Genesis",
    coinSymbol: "tBABY",
  },
  v4devnet: {
    chainId: bbnV4Devnet.chainId,
    rpc: bbnV4Devnet.rpc,
    chainData: bbnV4Devnet,
    networkName: "Testnet BABY",
    networkFullName: "Testnet Babylon Genesis",
    coinSymbol: "tBABY",
  },
  testnet: {
    chainId: bbnTestnet.chainId,
    rpc: bbnTestnet.rpc,
    chainData: bbnTestnet,
    networkName: "Testnet BABY",
    networkFullName: "Testnet Babylon Genesis",
    coinSymbol: "tBABY",
  },
};

export function getNetworkConfigBBN(): BBNConfig {
  return config[network] ?? config[defaultNetwork];
}
