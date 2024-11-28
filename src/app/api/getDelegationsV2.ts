import { encode } from "url-safe-base64";

import { Pagination } from "../types/api";
import {
  DelegationV2,
  getDelegationV2StakingState,
} from "../types/delegationsV2";

import { apiWrapper } from "./apiWrapper";

export interface PaginatedDelegations {
  delegations: DelegationV2[];
  pagination: Pagination;
}

interface DelegationV2APIResponse {
  data: DelegationV2API;
}

interface DelegationsV2APIResponse {
  data: DelegationV2API[];
  pagination: Pagination;
}
interface DelegationV2API {
  finality_provider_btc_pks_hex: string[];
  params_version: number;
  staker_btc_pk_hex: string;
  delegation_staking: {
    staking_tx_hex: string;
    staking_tx_hash_hex: string;
    staking_time: number;
    staking_amount: number;
    start_height: number;
    end_height: number;
    bbn_inception_height: number;
    bbn_inception_time: number;
    slashing_tx_hex: string;
  };
  delegation_unbonding: {
    unbonding_time: number;
    unbonding_tx: string;
    covenant_unbonding_signatures?: {
      covenant_btc_pk_hex: string;
      signature_hex: string;
    }[];
    slashing_tx_hex: string;
  };
  state: string;
}

export const getDelegationV2 = async (
  stakingTxHashHex: string,
): Promise<DelegationV2> => {
  if (!stakingTxHashHex) {
    throw new Error("No staking tx hash provided");
  }
  const params = {
    staking_tx_hash_hex: stakingTxHashHex,
  };

  const response = await apiWrapper(
    "GET",
    "/v2/delegation",
    "Error getting delegation v2",
    params,
  );

  const delegationAPIResponse: DelegationV2APIResponse = response.data;

  const state = getDelegationV2StakingState(delegationAPIResponse.data.state);

  return {
    finalityProviderBtcPksHex:
      delegationAPIResponse.data.finality_provider_btc_pks_hex,
    stakingTxHex: delegationAPIResponse.data.delegation_staking.staking_tx_hex,
    paramsVersion: delegationAPIResponse.data.params_version,
    stakerBtcPkHex: delegationAPIResponse.data.staker_btc_pk_hex,
    stakingAmount: delegationAPIResponse.data.delegation_staking.staking_amount,
    stakingTime: delegationAPIResponse.data.delegation_staking.staking_time,
    stakingTxHashHex:
      delegationAPIResponse.data.delegation_staking.staking_tx_hash_hex,
    startHeight: delegationAPIResponse.data.delegation_staking.start_height,
    endHeight: delegationAPIResponse.data.delegation_staking.end_height,
    bbnInceptionHeight:
      delegationAPIResponse.data.delegation_staking.bbn_inception_height,
    bbnInceptionTime:
      delegationAPIResponse.data.delegation_staking.bbn_inception_time,
    stakingSlashingTxHex:
      delegationAPIResponse.data.delegation_staking.slashing_tx_hex,
    state,
    unbondingTime:
      delegationAPIResponse.data.delegation_unbonding.unbonding_time,
    unbondingTxHex:
      delegationAPIResponse.data.delegation_unbonding.unbonding_tx,
    slashingTxHex:
      delegationAPIResponse.data.delegation_staking.slashing_tx_hex,
    covenantUnbondingSignatures:
      delegationAPIResponse.data.delegation_unbonding.covenant_unbonding_signatures?.map(
        (signature) => ({
          covenantBtcPkHex: signature.covenant_btc_pk_hex,
          signatureHex: signature.signature_hex,
        }),
      ),
    unbondingSlashingTxHex:
      delegationAPIResponse.data.delegation_unbonding.slashing_tx_hex,
  };
};

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
    "/v2/delegations",
    "Error getting delegations v2",
    params,
  );

  const delegationsAPIResponse: DelegationsV2APIResponse = response.data;

  const delegations: DelegationV2[] = delegationsAPIResponse.data.map(
    (apiDelegation: DelegationV2API): DelegationV2 => {
      const state = getDelegationV2StakingState(apiDelegation.state);
      return {
        finalityProviderBtcPksHex: apiDelegation.finality_provider_btc_pks_hex,
        stakingTxHex: apiDelegation.delegation_staking.staking_tx_hex,
        paramsVersion: apiDelegation.params_version,
        stakerBtcPkHex: apiDelegation.staker_btc_pk_hex,
        stakingAmount: apiDelegation.delegation_staking.staking_amount,
        stakingTime: apiDelegation.delegation_staking.staking_time,
        stakingTxHashHex: apiDelegation.delegation_staking.staking_tx_hash_hex,
        startHeight: apiDelegation.delegation_staking.start_height,
        endHeight: apiDelegation.delegation_staking.end_height,
        bbnInceptionHeight:
          apiDelegation.delegation_staking.bbn_inception_height,
        bbnInceptionTime: apiDelegation.delegation_staking.bbn_inception_time,
        stakingSlashingTxHex: apiDelegation.delegation_staking.slashing_tx_hex,
        state,
        unbondingTime: apiDelegation.delegation_unbonding.unbonding_time,
        unbondingTxHex: apiDelegation.delegation_unbonding.unbonding_tx,
        unbondingSlashingTxHex:
        apiDelegation.delegation_unbonding.slashing_tx_hex,
        covenantUnbondingSignatures:
        apiDelegation.delegation_unbonding.covenant_unbonding_signatures?.map(
          (signature) => ({
            covenantBtcPkHex: signature.covenant_btc_pk_hex,
            signatureHex: signature.signature_hex,
          }),
        ),
        slashingTxHex: apiDelegation.delegation_staking.slashing_tx_hex,
      };
    },
  );

  const pagination: Pagination = {
    next_key: delegationsAPIResponse.pagination.next_key,
  };
  return { delegations: delegations, pagination };
};
