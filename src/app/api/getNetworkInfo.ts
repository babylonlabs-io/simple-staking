import { getPublicKeyNoCoord } from "@babylonlabs-io/btc-staking-ts";
import { AxiosResponse } from "axios";

import { NetworkInfo } from "../types/networkInfo";

import { apiWrapper } from "./apiWrapper";

interface NetworkInfoDataResponse {
  data: NetworkInfoAPI;
}

export interface BtcCheckpointParams {
  version: number;
  btc_confirmation_depth: number;
}

interface StakingStatus {
  is_staking_open: boolean;
}

interface NetworkInfoAPI {
  staking_status: StakingStatus;
  params: {
    bbn: BbnParams[];
    btc: BtcCheckpointParams[];
  };
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

export const getNetworkInfo = async (): Promise<NetworkInfo> => {
  const { data } = (await apiWrapper(
    "GET",
    "/v2/network-info",
    "Error getting network info",
  )) as AxiosResponse<NetworkInfoDataResponse>;
  const { params, staking_status } = data.data;

  const stakingVersions = (params.bbn || [])
    .sort((a, b) => a.version - b.version) // Sort by version ascending
    .map((v) => ({
      version: v.version,
      covenantNoCoordPks: v.covenant_pks.map((pk) =>
        String(getPublicKeyNoCoord(pk)),
      ),
      covenantQuorum: v.covenant_quorum,
      minStakingValueSat: v.min_staking_value_sat,
      maxStakingValueSat: v.max_staking_value_sat,
      minStakingTimeBlocks: v.min_staking_time_blocks,
      maxStakingTimeBlocks: v.max_staking_time_blocks,
      // TODO: To be reverted after https://github.com/babylonlabs-io/babylon/issues/263
      unbondingTime: v.min_unbonding_time_blocks + 1,
      unbondingFeeSat: v.unbonding_fee_sat,
      minCommissionRate: v.min_commission_rate,
      maxActiveFinalityProviders: v.max_active_finality_providers,
      delegationCreationBaseGasFee: v.delegation_creation_base_gas_fee,
      slashing: {
        slashingPkScriptHex: v.slashing_pk_script,
        slashingRate: parseFloat(v.slashing_rate),
        minSlashingTxFeeSat: v.min_slashing_tx_fee_sat,
      },
      maxStakingAmountSat: v.max_staking_value_sat,
      minStakingAmountSat: v.min_staking_value_sat,
    }));

  const latestStakingParam = stakingVersions.reduce((prev, current) =>
    current.version > prev.version ? current : prev,
  );

  // Map the BTC checkpoint params to the expected format
  const epochCheckVersions = (params.btc || [])
    .sort((a, b) => a.version - b.version) // Sort by version ascending
    .map((v) => ({
      version: v.version,
      btcConfirmationDepth: v.btc_confirmation_depth,
    }));

  // Get the latest epoch check param
  const latestEpochCheckParam = epochCheckVersions.reduce((prev, current) =>
    current.version > prev.version ? current : prev,
  );

  const genesisStakingParam = stakingVersions.find((v) => v.version === 0);
  if (!genesisStakingParam) {
    throw new Error("Genesis staking params not found");
  }

  // Find the genesis epoch check param (version 0)
  const genesisEpochCheckParam = epochCheckVersions.find(
    (v) => v.version === 0,
  );
  if (!genesisEpochCheckParam) {
    throw new Error("Genesis epoch check params not found");
  }

  return {
    stakingStatus: {
      isStakingOpen: staking_status.is_staking_open,
    },
    params: {
      bbnStakingParams: {
        latestParam: latestStakingParam,
        versions: stakingVersions,
        genesisParam: genesisStakingParam,
      },
      btcEpochCheckParams: {
        latestParam: latestEpochCheckParam,
        versions: epochCheckVersions,
        genesisParam: genesisEpochCheckParam,
      },
    },
  };
};
