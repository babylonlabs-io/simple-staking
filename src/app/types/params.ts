export interface BbnParamsVersion {
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
}

export interface Params {
  bbn: BbnParamsVersion[];
}
