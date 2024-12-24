import { BBNConfig } from "@babylonlabs-io/bbn-wallet-connect";

import { Network } from "@/utils/wallet/btc_wallet_provider";

import { bbnDevnet } from "./bbn/devnet";
import { bbnTestnet } from "./bbn/testnet";

export const network =
  (process.env.NEXT_PUBLIC_NETWORK as Network) || Network.SIGNET;

const mainnetConfig: BBNConfig = {
  chainId: bbnTestnet.chainId,
  rpc: bbnTestnet.rpc,
  chainData: bbnTestnet,
};

const signetConfig: BBNConfig = {
  chainId: bbnTestnet.chainId,
  rpc: bbnTestnet.rpc,
  chainData: bbnTestnet,
};

const testnetConfig: BBNConfig = {
  chainId: bbnDevnet.chainId,
  rpc: bbnDevnet.rpc,
  chainData: bbnDevnet,
};

const config: Record<string, BBNConfig> = {
  mainnet: mainnetConfig,
  signet: signetConfig,
  testnet: testnetConfig,
};

export function getNetworkConfigBBN(): BBNConfig {
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
