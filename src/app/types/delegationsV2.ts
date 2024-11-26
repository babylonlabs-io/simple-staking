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
  unbondingTxHex: string;
  state: DelegationV2StakingState;
  covenantUnbondingSignatures?: {
    covenantBtcPkHex: string;
    signatureHex: string;
  }[];
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
  TIMELOCK_SLASHED = "TIMELOCK_SLASHED",
  EARLY_UNBONDING_SLASHED = "EARLY_UNBONDING_SLASHED",

  // Intermediate states
  INTERMEDIATE_PENDING_VERIFICATION = "INTERMEDIATE_PENDING_VERIFICATION",
  INTERMEDIATE_PENDING_BTC_CONFIRMATION = "INTERMEDIATE_PENDING_BTC_CONFIRMATION",
  INTERMEDIATE_UNBONDING_SUBMITTED = "INTERMEDIATE_UNBONDING_SUBMITTED",
  INTERMEDIATE_WITHDRAWAL_SUBMITTED = "INTERMEDIATE_WITHDRAWAL_SUBMITTED",
}

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
