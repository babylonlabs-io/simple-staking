import { getPublicKeyNoCoord } from "@babylonlabs-io/btc-staking-ts";

import { ClientError, ERROR_CODES } from "@/ui/common/errors";

import { NetworkInfo, NetworkUpgradeConfig } from "../types/networkInfo";

import { apiWrapper } from "./apiWrapper";

interface NetworkInfoDataResponse {
  data: NetworkInfoAPI;
}

export interface BtcCheckpointParams {
  version: number;
  btc_confirmation_depth: number;
}

interface AllowList {
  is_expired: boolean;
}

interface StakingStatus {
  is_staking_open: boolean;
  staking_expansion_allow_list?: AllowList;
}

interface NetworkInfoAPI {
  staking_status?: StakingStatus;
  params: {
    bbn: BbnParams[];
    btc: BtcCheckpointParams[];
  };
  network_upgrade?: NetworkUpgradeConfig;
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
  unbonding_time_blocks: number;
  unbonding_fee_sat: number;
  min_commission_rate: string;
  max_finality_providers: number;
  delegation_creation_base_gas_fee: number;
  btc_activation_height: number;
  allow_list_expiration_height: number;
  btcActivationHeight?: number;
}

export const getNetworkInfo = async (): Promise<NetworkInfo> => {
  const response = await apiWrapper<NetworkInfoDataResponse>(
    "GET",
    "/v2/network-info",
    "Error getting network info",
  );
  const { data } = response;
  const { params, network_upgrade } = data.data;

  const stakingVersions = (params.bbn || [])
    .sort((a, b) => a.version - b.version)
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
      unbondingTime: v.unbonding_time_blocks,
      unbondingFeeSat: v.unbonding_fee_sat,
      minCommissionRate: v.min_commission_rate,
      maxFinalityProviders: v.max_finality_providers || 1, // default to 1 if not set
      delegationCreationBaseGasFee: v.delegation_creation_base_gas_fee,
      slashing: {
        slashingPkScriptHex: v.slashing_pk_script,
        slashingRate: parseFloat(v.slashing_rate),
        minSlashingTxFeeSat: v.min_slashing_tx_fee_sat,
      },
      maxStakingAmountSat: v.max_staking_value_sat,
      minStakingAmountSat: v.min_staking_value_sat,
      btcActivationHeight: v.btc_activation_height,
      allowListExpirationHeight: v.allow_list_expiration_height,
    }));

  // Verify that version numbers and BTC activation heights are consistently ordered
  const sortedByVersion = stakingVersions.toSorted(
    (a, b) => b.version - a.version,
  );
  const sortedByHeight = stakingVersions.toSorted(
    (a, b) => b.btcActivationHeight - a.btcActivationHeight,
  );

  // Verify both sorts produce same order
  const areEqual = sortedByVersion.every(
    (param, index) => param === sortedByHeight[index],
  );
  if (!areEqual) {
    const clientError = new ClientError(
      ERROR_CODES.EXTERNAL_SERVICE_UNAVAILABLE,
      "Version numbers and BTC activation heights are not consistently ordered",
    );
    throw clientError;
  }

  const latestStakingParam = stakingVersions.reduce((prev, current) =>
    current.version > prev.version ? current : prev,
  );

  // Map the BTC checkpoint params to the expected format
  const epochCheckVersions = (params.btc || [])
    .sort((a, b) => a.version - b.version)
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
    const clientError = new ClientError(
      ERROR_CODES.EXTERNAL_SERVICE_UNAVAILABLE,
      "Genesis staking params not found",
    );
    throw clientError;
  }

  // Find the genesis epoch check param (version 0)
  const genesisEpochCheckParam = epochCheckVersions.find(
    (v) => v.version === 0,
  );
  if (!genesisEpochCheckParam) {
    const clientError = new ClientError(
      ERROR_CODES.EXTERNAL_SERVICE_UNAVAILABLE,
      "Genesis epoch check params not found",
    );
    throw clientError;
  }

  return {
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
    networkUpgrade: network_upgrade,
  };
};
