export interface DelegationV2 {
  endHeight: number;
  finalityProviderBtcPksHex: string[];
  paramsVersion: string;
  stakerBtcPkHex: string;
  stakingAmount: string;
  stakingTime: string;
  stakingTxHashHex: string;
  startHeight: number;
  state: DelegationV2State;
  unbondingTime: string;
  unbondingTx: string;
}

export type DelegationV2State =
  | "PENDING"
  | "VERIFIED"
  | "ACTIVE"
  | "UNBONDING"
  | "WITHDRAWABLE"
  | "WITHDRAWN"
  | "SLASHED";
