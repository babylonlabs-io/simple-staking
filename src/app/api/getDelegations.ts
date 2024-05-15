import { encode } from "url-safe-base64";

import { apiWrapper } from "./apiWrapper";

export interface Delegations {
  data: Delegation[];
  pagination: Pagination;
}

export interface Delegation {
  staking_tx_hash_hex: string;
  staker_pk_hex: string;
  finality_provider_pk_hex: string;
  state: string;
  staking_value: number;
  staking_tx: StakingTx;
  unbonding_tx?: UnbondingTx;
  is_overflow: boolean;
}

export interface StakingTx {
  tx_hex: string;
  output_index: number;
  start_timestamp: string;
  start_height: number;
  timelock: number;
}

export interface UnbondingTx {
  tx_hex: string;
  output_index: number;
}

interface Pagination {
  next_key: string;
}

export const getDelegations = async (
  key: string,
  publicKeyNoCoord?: string,
): Promise<Delegations> => {
  if (!publicKeyNoCoord) {
    throw new Error("No public key provided");
  }

  const limit = 100;
  const reverse = false;

  const params = {
    "pagination.key": encode(key),
    // "pagination.reverse": reverse,
    // "pagination.limit": limit,
    staker_btc_pk: encode(publicKeyNoCoord),
  };

  const response = await apiWrapper(
    "GET",
    "/v1/staker/delegations",
    "Error getting delegations",
    params,
  );

  return response.data;
};