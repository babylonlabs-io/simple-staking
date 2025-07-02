import { BBNConfig, BTCConfig } from "@babylonlabs-io/wallet-connector";

import { getNetworkConfigBBN } from "./bbn";
import { getNetworkConfigBTC } from "./btc";

export interface NetworkConfig {
  bbn: BBNConfig;
  btc: BTCConfig;
}

// Get all network configs
export const getNetworkConfig = (): NetworkConfig => {
  return {
    bbn: getNetworkConfigBBN(),
    btc: getNetworkConfigBTC(),
  };
};
