import { Delegation } from "@/app/api/getDelegations";

export const toLocalStorageIntermediateDelegation = (
  stakingTxHashHex: string,
  stakerPkHex: string,
  finalityProviderPkHex: string,
  stakingValue: number,
  stakingTxHex: string,
  timelock: number,
  state: string,
): Delegation => ({
  staking_tx_hash_hex: stakingTxHashHex,
  staker_pk_hex: stakerPkHex,
  finality_provider_pk_hex: finalityProviderPkHex,
  state,
  staking_value: stakingValue,
  staking_tx: {
    tx_hex: stakingTxHex,
    output_index: 0,
    start_timestamp: new Date().toISOString(),
    start_height: 0,
    timelock,
  },
  is_overflow: false,
});
