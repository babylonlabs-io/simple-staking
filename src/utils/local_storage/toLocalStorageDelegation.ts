import { Delegation } from "@/app/api/getDelegations";

export const toLocalStorageDelegation = (
  stakingTxHashHex: string,
  stakerPkHex: string,
  finalityProviderPkHex: string,
  stakingValue: number,
  stakingTxHex: string,
  timelock: number,
): Delegation => ({
  staking_tx_hash_hex: stakingTxHashHex,
  staker_pk_hex: stakerPkHex,
  finality_provider_pk_hex: finalityProviderPkHex,
  state: "pending",
  staking_value: stakingValue,
  staking_tx: {
    tx_hex: stakingTxHex,
    output_index: 0,
    start_timestamp: new Date().toISOString(),
    start_height: 0,
    timelock,
  },
});
