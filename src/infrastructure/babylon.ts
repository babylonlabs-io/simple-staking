import { createLCDClient, txs, utils } from "@babylonlabs-io/babylon-proto-ts";

import { getNetworkConfigBBN } from "@/ui/common/config/network/bbn";

let clientInstance: Awaited<ReturnType<typeof createLCDClient>> | null = null;

export const getBabylonClient = async () => {
  if (!clientInstance) {
    const networkConfig = getNetworkConfigBBN();
    clientInstance = await createLCDClient({ url: networkConfig.lcdUrl });
  }
  return clientInstance;
};

export default {
  client: getBabylonClient,
  txs,
  utils,
};
