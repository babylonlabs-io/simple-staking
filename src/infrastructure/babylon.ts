import { createLCDClient, txs, utils } from "@babylonlabs-io/babylon-proto-ts";

import config from "./config";

export default {
  client: await createLCDClient({ url: config.babylon.rpcUrl }),
  txs,
  utils,
};
