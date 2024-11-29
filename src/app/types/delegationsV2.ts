export interface DelegationLike {
  stakingAmount: number;
  stakingTxHashHex: string;
  startHeight: number;
  state: DelegationV2StakingState;
}

export interface DelegationV2 extends DelegationLike {
  stakingTxHex: string;
  stakingSlashingTxHex: string;
  paramsVersion: number;
  finalityProviderBtcPksHex: string[];
  stakerBtcPkHex: string;
  stakingTime: number;
  bbnInceptionHeight: number;
  bbnInceptionTime: number;
  startHeight: number;
  endHeight: number;
  unbondingTime: number;
  unbondingTxHex: string;
  covenantUnbondingSignatures?: {
    covenantBtcPkHex: string;
    signatureHex: string;
  }[];
  slashingTxHex: string;
  unbondingSlashingTxHex: string;
}

export enum DelegationV2StakingState {
  // Basic states
  PENDING = "PENDING",
  VERIFIED = "VERIFIED",
  ACTIVE = "ACTIVE",

  // Unbonding states
  TIMELOCK_UNBONDING = "TIMELOCK_UNBONDING",
  EARLY_UNBONDING = "EARLY_UNBONDING",

  // Withdrawable states
  TIMELOCK_WITHDRAWABLE = "TIMELOCK_WITHDRAWABLE",
  EARLY_UNBONDING_WITHDRAWABLE = "EARLY_UNBONDING_WITHDRAWABLE",
  TIMELOCK_SLASHING_WITHDRAWABLE = "TIMELOCK_SLASHING_WITHDRAWABLE",
  EARLY_UNBONDING_SLASHING_WITHDRAWABLE = "EARLY_UNBONDING_SLASHING_WITHDRAWABLE",

  // Withdrawn states
  TIMELOCK_WITHDRAWN = "TIMELOCK_WITHDRAWN",
  EARLY_UNBONDING_WITHDRAWN = "EARLY_UNBONDING_WITHDRAWN",
  TIMELOCK_SLASHING_WITHDRAWN = "TIMELOCK_SLASHING_WITHDRAWN",
  EARLY_UNBONDING_SLASHING_WITHDRAWN = "EARLY_UNBONDING_SLASHING_WITHDRAWN",

  // Slashed states
  SLASHED = "SLASHED",
  EARLY_UNBONDING_SLASHED = "EARLY_UNBONDING_SLASHED",
  TIMELOCK_SLASHED = "TIMELOCK_SLASHED",

  // Intermediate states
  INTERMEDIATE_PENDING_VERIFICATION = "INTERMEDIATE_PENDING_VERIFICATION",
  INTERMEDIATE_PENDING_BTC_CONFIRMATION = "INTERMEDIATE_PENDING_BTC_CONFIRMATION",
  INTERMEDIATE_UNBONDING_SUBMITTED = "INTERMEDIATE_UNBONDING_SUBMITTED",
  INTERMEDIATE_EARLY_UNBONDING_WITHDRAWAL_SUBMITTED = "INTERMEDIATE_EARLY_UNBONDING_WITHDRAWAL_SUBMITTED",
  INTERMEDIATE_EARLY_UNBONDING_SLASHING_WITHDRAWAL_SUBMITTED = "INTERMEDIATE_EARLY_UNBONDING_SLASHING_WITHDRAWAL_SUBMITTED",
  INTERMEDIATE_TIMELOCK_WITHDRAWAL_SUBMITTED = "INTERMEDIATE_TIMELOCK_WITHDRAWAL_SUBMITTED",
  INTERMEDIATE_TIMELOCK_SLASHING_WITHDRAWAL_SUBMITTED = "INTERMEDIATE_TIMELOCK_SLASHING_WITHDRAWAL_SUBMITTED",
}

export const DELEGATION_STATUSES = {
  [DelegationV2StakingState.PENDING]: 0,
  [DelegationV2StakingState.INTERMEDIATE_PENDING_VERIFICATION]: 0,
  [DelegationV2StakingState.VERIFIED]: 1,
  [DelegationV2StakingState.INTERMEDIATE_PENDING_BTC_CONFIRMATION]: 2,
  [DelegationV2StakingState.ACTIVE]: 3,

  [DelegationV2StakingState.INTERMEDIATE_UNBONDING_SUBMITTED]: 4,
  [DelegationV2StakingState.EARLY_UNBONDING]: 5,
  [DelegationV2StakingState.EARLY_UNBONDING_WITHDRAWABLE]: 6,
  [DelegationV2StakingState.INTERMEDIATE_EARLY_UNBONDING_WITHDRAWAL_SUBMITTED]: 7,
  [DelegationV2StakingState.EARLY_UNBONDING_WITHDRAWN]: 8,

  [DelegationV2StakingState.SLASHED]: 9,
  [DelegationV2StakingState.EARLY_UNBONDING_SLASHED]: 9,
  [DelegationV2StakingState.EARLY_UNBONDING_SLASHING_WITHDRAWABLE]: 10,
  [DelegationV2StakingState.INTERMEDIATE_EARLY_UNBONDING_SLASHING_WITHDRAWAL_SUBMITTED]: 11,
  [DelegationV2StakingState.EARLY_UNBONDING_SLASHING_WITHDRAWN]: 12,

  [DelegationV2StakingState.TIMELOCK_UNBONDING]: 13,
  [DelegationV2StakingState.TIMELOCK_WITHDRAWABLE]: 14,
  [DelegationV2StakingState.INTERMEDIATE_TIMELOCK_WITHDRAWAL_SUBMITTED]: 15,
  [DelegationV2StakingState.TIMELOCK_WITHDRAWN]: 16,

  [DelegationV2StakingState.TIMELOCK_SLASHED]: 17,
  [DelegationV2StakingState.TIMELOCK_SLASHING_WITHDRAWABLE]: 18,
  [DelegationV2StakingState.INTERMEDIATE_TIMELOCK_SLASHING_WITHDRAWAL_SUBMITTED]: 19,
  [DelegationV2StakingState.TIMELOCK_SLASHING_WITHDRAWN]: 20,
} as const;

export const getDelegationV2StakingState = (
  state: string,
): DelegationV2StakingState => {
  const validState = Object.values(DelegationV2StakingState).find(
    (enumState) => enumState === state,
  );

  if (!validState) {
    throw new Error(`Invalid delegation state: ${state}`);
  }

  return validState;
};

export interface DelegationV2Params {
  currentTime: number;
}
