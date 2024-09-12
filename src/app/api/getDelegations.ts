import { encode } from "url-safe-base64";

import { Pagination } from "../types/api";
import { Delegation } from "../types/delegations";

import { apiWrapper } from "./apiWrapper";

export interface PaginatedDelegations {
  delegations: Delegation[];
  pagination: Pagination;
}

interface DelegationsAPIResponse {
  data: DelegationAPI[];
  pagination: Pagination;
}

interface DelegationAPI {
  staking_tx_hash_hex: string;
  staker_pk_hex: string;
  finality_provider_pk_hex: string;
  state: string;
  staking_value: number;
  staking_tx: StakingTxAPI;
  unbonding_tx?: UnbondingTxAPI;
  is_overflow: boolean;
}

interface StakingTxAPI {
  tx_hex: string;
  output_index: number;
  start_timestamp: string;
  start_height: number;
  timelock: number;
}

interface UnbondingTxAPI {
  tx_hex: string;
  output_index: number;
}

export const getDelegations = async (
  key: string,
  publicKeyNoCoord?: string,
): Promise<PaginatedDelegations> => {
  if (!publicKeyNoCoord) {
    throw new Error("No public key provided");
  }

  // const limit = 100;
  // const reverse = false;

  const params = {
    pagination_key: encode(key),
    // "pagination_reverse": reverse,
    // "pagination_limit": limit,
    staker_btc_pk: encode(publicKeyNoCoord),
  };

  const response = await apiWrapper(
    "GET",
    "/v1/staker/delegations",
    "Error getting delegations",
    params,
  );

  const delegationsAPIResponse: DelegationsAPIResponse = response.data;

  const delegations: Delegation[] = delegationsAPIResponse.data.map(
    (apiDelegation: DelegationAPI): Delegation => ({
      stakingTxHashHex: apiDelegation.staking_tx_hash_hex,
      stakerPkHex: apiDelegation.staker_pk_hex,
      finalityProviderPkHex: apiDelegation.finality_provider_pk_hex,
      state: apiDelegation.state,
      stakingValueSat: apiDelegation.staking_value,
      stakingTx: {
        txHex: apiDelegation.staking_tx.tx_hex,
        outputIndex: apiDelegation.staking_tx.output_index,
        startTimestamp: apiDelegation.staking_tx.start_timestamp,
        startHeight: apiDelegation.staking_tx.start_height,
        timelock: apiDelegation.staking_tx.timelock,
      },
      isOverflow: apiDelegation.is_overflow,
      unbondingTx: apiDelegation.unbonding_tx
        ? {
            txHex: apiDelegation.unbonding_tx.tx_hex,
            outputIndex: apiDelegation.unbonding_tx.output_index,
          }
        : undefined,
    }),
  );

  const pagination: Pagination = {
    next_key: delegationsAPIResponse.pagination.next_key,
  };
  return { delegations: delegations, pagination };
};
