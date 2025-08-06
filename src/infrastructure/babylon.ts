import { createLCDClient, txs, utils } from "@babylonlabs-io/babylon-proto-ts";

import config from "./config";

let clientInstance: Awaited<ReturnType<typeof createLCDClient>> | null = null;

export const getBabylonClient = async () => {
  if (!clientInstance) {
    clientInstance = await createLCDClient({ url: config.babylon.lcdUrl });
  }
  return clientInstance;
};

export default {
  client: getBabylonClient,
  txs,
  utils,
};
