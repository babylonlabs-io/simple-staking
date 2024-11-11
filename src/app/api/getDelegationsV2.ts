import { encode } from "url-safe-base64";

import { Pagination } from "../types/api";
import { DelegationV2, DelegationV2State } from "../types/delegationsV2";

import { apiWrapper } from "./apiWrapper";

export interface PaginatedDelegations {
  delegations: DelegationV2[];
  pagination: Pagination;
}

interface DelegationsAPIResponse {
  data: DelegationV2API[];
  pagination: Pagination;
}

interface DelegationV2API {
  finality_provider_btc_pks_hex: string[];
  params_version: string;
  staker_btc_pk_hex: string;
  staking_amount: string;
  staking_time: string;
  staking_tx_hash_hex: string;
  start_height: number;
  end_height: number;
  state: DelegationV2State;
  unbonding_time: string;
  unbonding_tx: string;
}

export const getDelegationsV2 = async (
  publicKeyNoCoord: string,
  pageKey?: string,
): Promise<PaginatedDelegations> => {
  if (!publicKeyNoCoord) {
    throw new Error("No public key provided");
  }
  const params = {
    staker_pk_hex: encode(publicKeyNoCoord),
    pagination_key: pageKey ? encode(pageKey) : "",
  };

  const response = await apiWrapper(
    "GET",
    "/v2/staker/delegations",
    "Error getting delegations v2",
    params,
  );

  const delegationsAPIResponse: DelegationsAPIResponse = response.data;

  const delegations: DelegationV2[] = delegationsAPIResponse.data.map(
    (apiDelegation: DelegationV2API): DelegationV2 => ({
      finalityProviderBtcPksHex: apiDelegation.finality_provider_btc_pks_hex,
      paramsVersion: apiDelegation.params_version,
      stakerBtcPkHex: apiDelegation.staker_btc_pk_hex,
      stakingAmount: apiDelegation.staking_amount,
      stakingTime: apiDelegation.staking_time,
      stakingTxHashHex: apiDelegation.staking_tx_hash_hex,
      startHeight: apiDelegation.start_height,
      endHeight: apiDelegation.end_height,
      state: apiDelegation.state,
      unbondingTime: apiDelegation.unbonding_time,
      unbondingTx: apiDelegation.unbonding_tx,
    }),
  );

  const pagination: Pagination = {
    next_key: delegationsAPIResponse.pagination.next_key,
  };
  return { delegations: delegations, pagination };
};
