import type { BBNConfig } from "@babylonlabs-io/wallet-connector";

import babyLogo from "@/ui/common/assets/baby.png";

import { bbnBsnDevnet } from "./bbn/bsn-devnet";
import { bbnCanary } from "./bbn/canary";
import { bbnDevnet } from "./bbn/devnet";
import { bbnEdgeDevnet } from "./bbn/edge-devnet";
import { bbnMainnet } from "./bbn/mainnet";
import { bbnTestnet } from "./bbn/testnet";

interface ExtendedBBNConfig extends BBNConfig {
  displayUSD: boolean;
  logo: string;
}

const defaultNetwork = "devnet";
export const network = process.env.NEXT_PUBLIC_NETWORK ?? defaultNetwork;

const config: Record<string, ExtendedBBNConfig> = {
  mainnet: {
    chainId: bbnMainnet.chainId,
    rpc: bbnMainnet.rpc,
    chainData: bbnMainnet,
    networkName: "BABY",
    networkFullName: "Babylon Genesis",
    coinSymbol: "BABY",
    displayUSD: true,
    logo: babyLogo,
  },
  canary: {
    chainId: bbnCanary.chainId,
    rpc: bbnCanary.rpc,
    chainData: bbnCanary,
    networkName: "BABY",
    networkFullName: "Babylon Genesis",
    coinSymbol: "BABY",
    displayUSD: true,
    logo: babyLogo,
  },
  devnet: {
    chainId: bbnDevnet.chainId,
    rpc: bbnDevnet.rpc,
    chainData: bbnDevnet,
    networkName: "Testnet BABY",
    networkFullName: "Testnet Babylon Genesis",
    coinSymbol: "tBABY",
    displayUSD: false,
    logo: babyLogo,
  },
  bsnDevnet: {
    chainId: bbnBsnDevnet.chainId,
    rpc: bbnBsnDevnet.rpc,
    chainData: bbnBsnDevnet,
    networkName: "Testnet BABY",
    networkFullName: "Testnet Babylon Genesis",
    coinSymbol: "tBABY",
    displayUSD: false,
    logo: babyLogo,
  },
  edgeDevnet: {
    chainId: bbnEdgeDevnet.chainId,
    rpc: bbnEdgeDevnet.rpc,
    chainData: bbnEdgeDevnet,
    networkName: "Testnet BABY",
    networkFullName: "Testnet Babylon Genesis",
    coinSymbol: "tBABY",
    displayUSD: false,
    logo: babyLogo,
  },
  testnet: {
    chainId: bbnTestnet.chainId,
    rpc: bbnTestnet.rpc,
    chainData: bbnTestnet,
    networkName: "Testnet BABY",
    networkFullName: "Testnet Babylon Genesis",
    coinSymbol: "tBABY",
    displayUSD: false,
    logo: babyLogo,
  },
};

export function getNetworkConfigBBN(): ExtendedBBNConfig {
  return config[network] ?? config[defaultNetwork];
}
