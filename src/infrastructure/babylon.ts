import { createClient, txs, utils } from "@babylonlabs-io/babylon-proto-ts";

import config from "./config";

export default {
  client: await createClient({ rpcUrl: config.babylon.rpcUrl }),
  txs,
  utils,
};
