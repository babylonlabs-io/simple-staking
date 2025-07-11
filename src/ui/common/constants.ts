import babylon from "@/ui/common/assets/chains/babylon-genesis.png";
import cosmos from "@/ui/common/assets/chains/cosmos.png";
import ethereum from "@/ui/common/assets/chains/ethereum.png";
import placeholder from "@/ui/common/assets/chains/placeholder.svg";
import sui from "@/ui/common/assets/chains/sui.png";
import { getNetworkConfigBBN } from "@/ui/common/config/network/bbn";

const { chainId: BABYLON_BSN_ID } = getNetworkConfigBBN();

export const chainLogos: Record<string, string> = {
  babylon,
  [BABYLON_BSN_ID]: babylon,
  cosmos,
  ethereum,
  sui,
  placeholder,
};

export const chainNames = {
  babylon: "Babylon Genesis",
  cosmos: "Cosmos",
  ethereum: "Ethereum",
  sui: "Sui",
  unknown: "Unknown Chain",
} as const;

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

export const BBN_FEE_AMOUNT = process.env.NEXT_PUBLIC_BBN_FEE_AMOUNT;

export const MEMPOOL_API =
  process.env.NEXT_PUBLIC_MEMPOOL_API || "https://mempool.space";

export const STAKING_DISABLED =
  process.env.NEXT_PUBLIC_STAKING_DISABLED === "true";

export const BABYLON_EXPLORER = process.env.NEXT_PUBLIC_BABYLON_EXPLORER ?? "";

export const REPLAYS_ON_ERROR_RATE = parseFloat(
  process.env.NEXT_PUBLIC_REPLAYS_RATE ?? "0.05",
);
