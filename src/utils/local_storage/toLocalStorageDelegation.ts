import { Delegation, DelegationState } from "@/app/types/delegations";

export const toLocalStorageDelegation = (
  stakingTxHashHex: string,
  stakerPkHex: string,
  finalityProviderPkHex: string,
  stakingValueSat: number,
  stakingTxHex: string,
  timelock: number,
): Delegation => ({
  stakingTxHashHex: stakingTxHashHex,
  stakerPkHex: stakerPkHex,
  finalityProviderPkHex: finalityProviderPkHex,
  state: DelegationState.PENDING,
  stakingValueSat: stakingValueSat,
  stakingTx: {
    txHex: stakingTxHex,
    outputIndex: 0,
    startTimestamp: new Date().toISOString(),
    startHeight: 0,
    timelock,
  },
  isOverflow: false,
  unbondingTx: undefined,
});
