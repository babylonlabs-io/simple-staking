import { balanceHandlers } from "./balance-handlers";
import { blockchainHandlers } from "./blockchain-handlers";
import { btcHandlers } from "./btc-handlers";
import { delegationHandlers } from "./delegation-handlers";
import { statsHandlers } from "./stats-handlers";
import { utilityHandlers } from "./utility-handlers";

export const handlers = [
  ...balanceHandlers,
  ...blockchainHandlers,
  ...btcHandlers,
  ...delegationHandlers,
  ...utilityHandlers,
  ...statsHandlers,
];
