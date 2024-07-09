import { DelegationState } from "@/app/types/delegations";
import { toLocalStorageDelegation } from "@/utils/local_storage/toLocalStorageDelegation";

describe("utils/local_storage/toLocalStorageDelegation", () => {
  it("should create a delegation object with the correct values", () => {
    const stakingTxHashHex = "hash1";
    const stakerPkHex = "staker1";
    const finalityProviderPkHex = "provider1";
    const stakingValueSat = 1000;
    const stakingTxHex = "txHex1";
    const timelock = 3600;

    const result = toLocalStorageDelegation(
      stakingTxHashHex,
      stakerPkHex,
      finalityProviderPkHex,
      stakingValueSat,
      stakingTxHex,
      timelock,
    );

    expect(result).toEqual({
      stakingTxHashHex,
      stakerPkHex,
      finalityProviderPkHex,
      state: DelegationState.PENDING,
      stakingValueSat,
      stakingTx: {
        txHex: stakingTxHex,
        outputIndex: 0,
        startTimestamp: expect.any(String),
        startHeight: 0,
        timelock,
      },
      isOverflow: false,
      unbondingTx: undefined,
    });

    // Validate startTimestamp is a valid ISO date string
    expect(new Date(result.stakingTx.startTimestamp).toISOString()).toBe(
      result.stakingTx.startTimestamp,
    );
  });
});
