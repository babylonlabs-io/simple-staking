export interface Delegation {
  startHeight: number;
  stakingValue: number;
  startTimestamp: number;
  txHash: string;
  state: string;
  points: number;
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
}
