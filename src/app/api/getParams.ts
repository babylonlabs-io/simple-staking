import { AxiosResponse } from "axios";

import { apiWrapper } from "./apiWrapper";

// Version-based params interfac
export interface ParamsV2Version {
  version: number;
  covenantPks: string[];
  covenantQuorum: number;
  minStakingValueSat: number;
  maxStakingValueSat: number;
  minStakingTimeBlocks: number;
  maxStakingTimeBlocks: number;
  slashingPkScript: string;
  minSlashingTxFeeSat: number;
  slashingRate: string;
  minUnbondingTimeBlocks: number;
  unbondingFeeSat: number;
  minCommissionRate: string;
  maxActiveFinalityProviders: number;
  delegationCreationBaseGasFee: number;
  btcConfirmationDepth: number;
}

interface ParamsV2DataResponse {
  data: {
    bbn: {
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
    }[];
    btc: {
      version: number;
      btc_confirmation_depth: number;
    }[];
  };
}

export const getParams = async (): Promise<ParamsV2Version[]> => {
  const { data } = (await apiWrapper(
    "GET",
    "/v2/global-params",
    "Error getting global params",
  )) as AxiosResponse<ParamsV2DataResponse>;

  const versions = data.data.bbn.map((bbn) => {
    const btc = data.data.btc.find((b) => b.version === bbn.version);

    return {
      version: bbn.version,
      covenantPks: bbn.covenant_pks,
      covenantQuorum: bbn.covenant_quorum,
      minStakingValueSat: bbn.min_staking_value_sat,
      maxStakingValueSat: bbn.max_staking_value_sat,
      minStakingTimeBlocks: bbn.min_staking_time_blocks,
      maxStakingTimeBlocks: bbn.max_staking_time_blocks,
      slashingPkScript: bbn.slashing_pk_script,
      minSlashingTxFeeSat: bbn.min_slashing_tx_fee_sat,
      slashingRate: bbn.slashing_rate,
      minUnbondingTimeBlocks: bbn.min_unbonding_time_blocks,
      unbondingFeeSat: bbn.unbonding_fee_sat,
      minCommissionRate: bbn.min_commission_rate,
      maxActiveFinalityProviders: bbn.max_active_finality_providers,
      delegationCreationBaseGasFee: bbn.delegation_creation_base_gas_fee,
      btcConfirmationDepth: btc?.btc_confirmation_depth ?? 0,
    };
  });

  return versions;
};
