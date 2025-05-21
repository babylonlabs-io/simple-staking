export const ONE_SECOND = 1000;
export const ONE_MINUTE = 60 * ONE_SECOND;

export const API_DEFAULT_RETRY_COUNT = 3;
export const API_DEFAULT_RETRY_DELAY = 3.5; // seconds

export const DELEGATION_ACTIONS = {
  STAKE: "STAKE",
  UNBOND: "UNBOND",
  WITHDRAW_ON_EARLY_UNBONDING: "WITHDRAW_ON_EARLY_UNBONDING",
  WITHDRAW_ON_TIMELOCK: "WITHDRAW_ON_TIMELOCK",
  WITHDRAW_ON_TIMELOCK_SLASHING: "WITHDRAW_ON_TIMELOCK_SLASHING",
  WITHDRAW_ON_EARLY_UNBONDING_SLASHING: "WITHDRAW_ON_EARLY_UNBONDING_SLASHING",
} as const;

export const DOCUMENTATION_LINKS = {
  TECHNICAL_PRELIMINARIES:
    "https://babylonlabs.io/blog/technical-preliminaries-of-bitcoin-staking",
} as const;

export const BBN_FEE_AMOUNT = import.meta.env.VITE_BBN_FEE_AMOUNT;

export const MEMPOOL_API =
  import.meta.env.VITE_MEMPOOL_API || "https://mempool.space";

export const STAKING_DISABLED =
  import.meta.env.VITE_STAKING_DISABLED === "true";

export const BABYLON_EXPLORER = import.meta.env.VITE_BABYLON_EXPLORER ?? "";

export const REPLAYS_ON_ERROR_RATE = parseFloat(
  import.meta.env.VITE_REPLAYS_RATE ?? "0.05",
);
