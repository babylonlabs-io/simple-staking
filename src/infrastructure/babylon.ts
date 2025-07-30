import { createLCDClient, txs, utils } from "@babylonlabs-io/babylon-proto-ts";

import config from "./config";

export default {
  // TODO: rename prop to `lcdUrl` in next release
  client: await createLCDClient({ lcdClient: config.babylon.lcdUrl }),
  txs,
  utils,
};
