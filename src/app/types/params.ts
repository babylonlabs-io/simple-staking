import { StakingParams } from "@babylonlabs-io/btc-staking-ts";

export interface BbnStakingParamsVersion extends StakingParams {
  version: number;
  minCommissionRate: string;
  maxActiveFinalityProviders: number;
  delegationCreationBaseGasFee: number;
}

export interface BtcEpochCheckParamsVersion {
  version: number;
  btcConfirmationDepth: number;
}

export interface BbnStakingParams {
  // The genesis params is the version 0 of the staking params which is
  // compatible with the phase-1 global params
  genesisParam: BbnStakingParamsVersion;
  // The latest params is the param with the highest version number
  latestParam: BbnStakingParamsVersion;
  versions: BbnStakingParamsVersion[];
}

export interface BtcEpochCheckParams {
  genesisParam: BtcEpochCheckParamsVersion;
  latestParam: BtcEpochCheckParamsVersion;
  versions: BtcEpochCheckParamsVersion[];
}

export interface Params {
  bbnStakingParams: BbnStakingParams;
  btcEpochCheckParams: BtcEpochCheckParams;
}
