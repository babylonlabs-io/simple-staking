import { getBtcNetwork } from "..";
import { getNetworkConfig } from "../network.config";

const bitcoin = {
  id: 1,
  name: "Bitcoin",
  type: "bitcoin" as any,
  network: "mainnet",
  backendUrls: {
    mempoolUrl: getNetworkConfig().mempoolApiUrl,
  },
};

const bitcoinSignet = {
  id: 2,
  name: "Bitcoin Signet",
  network: "signet",
  type: "bitcoin" as any,
  backendUrls: {
    mempoolUrl: getNetworkConfig().mempoolApiUrl,
  },
};

// Get the cooresponding btc chain config based on the network
export const getBtcChainConfig = () => {
  const network = getBtcNetwork();
  if (network === "mainnet") {
    return bitcoin;
  }
  return bitcoinSignet;
};
