export const ONE_SECOND = 1000;
export const ONE_MINUTE = 60 * ONE_SECOND;

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

export const BBN_FEE_AMOUNT = process.env.NEXT_PUBLIC_BBN_FEE_AMOUNT;

export const MEMPOOL_API =
  process.env.NEXT_PUBLIC_MEMPOOL_API || "https://mempool.space";

export const STAKING_DISABLED =
  process.env.NEXT_PUBLIC_STAKING_DISABLED === "true";
