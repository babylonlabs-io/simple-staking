import { StakingParams } from "@babylonlabs-io/btc-staking-ts";

export interface BbnStakingParamsVersion extends StakingParams {
  version: number;
  minCommissionRate: string;
  maxActiveFinalityProviders: number;
  delegationCreationBaseGasFee: number;
}

export interface BbnStakingParams {
  latestVersion: BbnStakingParamsVersion;
  versions: BbnStakingParamsVersion[];
}

export interface Params {
  bbnStakingParams: BbnStakingParams;
}
