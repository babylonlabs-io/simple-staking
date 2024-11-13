export interface Delegation {
  stakingTxHashHex: string;
  paramVersion: number;
  finalityProviderPks: string[];
  stakingTime: number;
  stakingAmount: number;
  unbondingTxHex: string;
  unbondingTime: number;
  state: string;
}

export interface DelegationParams {
  currentTime: number;
}

export enum DelegationState {
  ACTIVE = "active",
  UNBONDING_REQUESTED = "unbonding_requested",
  UNBONDING = "unbonding",
  UNBONDED = "unbonded",
  WITHDRAWN = "withdrawn",
  PENDING = "pending",
  OVERFLOW = "overflow",
  EXPIRED = "expired",
  INTERMEDIATE_UNBONDING = "intermediate_unbonding",
  INTERMEDIATE_WITHDRAWAL = "intermediate_withdrawal",
  INTERMEDIATE_TRANSITIONING = "intermediate_transitioning",
  TRANSITIONED = "transitioned",
}
