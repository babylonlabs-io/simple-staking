import { Delegation, DelegationState } from "@/app/types/delegations";

export function generateMockDelegation(
  hash: string,
  staker: string,
  provider: string,
  value: number,
  hoursAgo: number,
): Delegation {
  const currentTimestamp = new Date().getTime();
  return {
    stakingTxHashHex: hash,
    stakerPkHex: staker,
    finalityProviderPkHex: provider,
    state: DelegationState.PENDING,
    stakingValueSat: value,
    stakingTx: {
      txHex: `txHex-${hash}`,
      outputIndex: 0,
      startTimestamp: new Date(
        currentTimestamp - hoursAgo * 60 * 60 * 1000,
      ).toISOString(),
      startHeight: 0,
      timelock: 3600,
    },
    isOverflow: false,
    unbondingTx: undefined,
  };
}
