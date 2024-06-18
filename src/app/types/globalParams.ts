export interface GlobalParamsVersion {
  version: number;
  activationHeight: number;
  stakingCapSat: number;
  stakingCapHeight: number;
  tag: string;
  covenantPks: string[];
  covenantQuorum: number;
  unbondingTime: number;
  unbondingFeeSat: number;
  maxStakingAmountSat: number;
  minStakingAmountSat: number;
  maxStakingTimeBlocks: number;
  minStakingTimeBlocks: number;
  confirmationDepth: number;
}
