import { AxiosResponse } from "axios";

import { Params } from "../types/params";

import { apiWrapper } from "./apiWrapper";

export interface ParamsDataResponse {
  data: ParamsAPI;
}

export interface ParamsAPI {
  bbn: BbnParams[];
}

export interface BbnParams {
  version: number;
  covenant_pks: string[];
  covenant_quorum: number;
  min_staking_value_sat: number;
  max_staking_value_sat: number;
  min_staking_time_blocks: number;
  max_staking_time_blocks: number;
  slashing_pk_script: string;
  min_slashing_tx_fee_sat: number;
  slashing_rate: string;
  min_unbonding_time_blocks: number;
  unbonding_fee_sat: number;
  min_commission_rate: string;
  max_active_finality_providers: number;
  delegation_creation_base_gas_fee: number;
}

export const getParams = async (): Promise<Params> => {
  const { data } = (await apiWrapper(
    "GET",
    "/v2/global-params",
    "Error getting global params",
  )) as AxiosResponse<ParamsDataResponse>;

  const params = data.data;

  const bbnParams = params.bbn.map((v) => ({
    version: v.version,
    covenantPks: v.covenant_pks,
    covenantQuorum: v.covenant_quorum,
    minStakingValueSat: v.min_staking_value_sat,
    maxStakingValueSat: v.max_staking_value_sat,
    minStakingTimeBlocks: v.min_staking_time_blocks,
    maxStakingTimeBlocks: v.max_staking_time_blocks,
    slashingPkScript: v.slashing_pk_script,
    minSlashingTxFeeSat: v.min_slashing_tx_fee_sat,
    slashingRate: v.slashing_rate,
    minUnbondingTimeBlocks: v.min_unbonding_time_blocks,
    unbondingFeeSat: v.unbonding_fee_sat,
    minCommissionRate: v.min_commission_rate,
    maxActiveFinalityProviders: v.max_active_finality_providers,
    delegationCreationBaseGasFee: v.delegation_creation_base_gas_fee,
  }));

  return { bbn: bbnParams };
};
