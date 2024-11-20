export interface DelegationV2 {
  stakingTxHashHex: string;
  stakingTxHex: string;
  paramsVersion: number;
  finalityProviderBtcPksHex: string[];
  stakerBtcPkHex: string;
  stakingAmount: number;
  stakingTime: number;
  startHeight: number;
  endHeight: number;
  unbondingTime: number;
  unbondingTx: string;
  state: DelegationV2StakingState;
  covenantUnbondingSignatures?: {
    covenantBtcPkHex: string;
    signatureHex: string;
  }[];
}

export enum DelegationV2StakingState {
  PENDING = "PENDING",
  VERIFIED = "VERIFIED",
  ACTIVE = "ACTIVE",
  UNBONDING = "UNBONDING",
  WITHDRAWABLE = "WITHDRAWABLE",
  WITHDRAWN = "WITHDRAWN",
  INTERMEDIATE_PENDING_CONFIRMATION = "INTERMEDIATE_PENDING_CONFIRMATION",
  INTERMEDIATE_UNBONDING = "INTERMEDIATE_UNBONDING",
  INTERMEDIATE_WITHDRAWAL = "INTERMEDIATE_WITHDRAWAL",
}

export const DelegationV2StakingStateMap: Record<
  string,
  DelegationV2StakingState
> = {
  PENDING: DelegationV2StakingState.PENDING,
  VERIFIED: DelegationV2StakingState.VERIFIED,
  ACTIVE: DelegationV2StakingState.ACTIVE,
  UNBONDING: DelegationV2StakingState.UNBONDING,
  WITHDRAWABLE: DelegationV2StakingState.WITHDRAWABLE,
  WITHDRAWN: DelegationV2StakingState.WITHDRAWN,
  INTERMEDIATE_PENDING_CONFIRMATION:
    DelegationV2StakingState.INTERMEDIATE_PENDING_CONFIRMATION,
  INTERMEDIATE_UNBONDING: DelegationV2StakingState.INTERMEDIATE_UNBONDING,
  INTERMEDIATE_WITHDRAWAL: DelegationV2StakingState.INTERMEDIATE_WITHDRAWAL,
};

export interface DelegationV2Params {
  currentTime: number;
}
