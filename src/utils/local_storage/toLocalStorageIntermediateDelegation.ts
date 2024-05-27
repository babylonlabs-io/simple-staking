import { Delegation } from "@/app/types/delegations";

export const toLocalStorageIntermediateDelegation = (
  stakingTxHashHex: string,
  stakerPkHex: string,
  finalityProviderPkHex: string,
  stakingValueSat: number,
  stakingTxHex: string,
  timelock: number,
  state: string,
  startHeight: number,
): Delegation => ({
  stakingTxHashHex,
  stakerPkHex,
  finalityProviderPkHex,
  state,
  stakingValueSat,
  stakingTx: {
    txHex: stakingTxHex,
    outputIndex: 0,
    startTimestamp: new Date().toISOString(),
    startHeight,
    timelock,
  },
  isOverflow: false,
  unbondingTx: undefined,
});
