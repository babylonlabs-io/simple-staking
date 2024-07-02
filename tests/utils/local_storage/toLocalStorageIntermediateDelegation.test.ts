import { DelegationState } from "@/app/types/delegations";
import { toLocalStorageIntermediateDelegation } from "@/utils/local_storage/toLocalStorageIntermediateDelegation";

describe("utils/local_storage/toLocalStorageIntermediateDelegation", () => {
  it("should create an intermediate unbonding delegation object with the correct values", () => {
    const stakingTxHashHex = "hash2";
    const stakerPkHex = "staker2";
    const finalityProviderPkHex = "provider2";
    const stakingValueSat = 2000;
    const stakingTxHex = "txHex2";
    const timelock = 7200;
    const state = DelegationState.INTERMEDIATE_UNBONDING;

    const result = toLocalStorageIntermediateDelegation(
      stakingTxHashHex,
      stakerPkHex,
      finalityProviderPkHex,
      stakingValueSat,
      stakingTxHex,
      timelock,
      state,
    );

    expect(result).toEqual({
      stakingTxHashHex,
      stakerPkHex,
      finalityProviderPkHex,
      state,
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

  it("should create an intermediate withdrawal delegation object with the correct values", () => {
    const stakingTxHashHex = "hash3";
    const stakerPkHex = "staker3";
    const finalityProviderPkHex = "provider3";
    const stakingValueSat = 3000;
    const stakingTxHex = "txHex3";
    const timelock = 14400;
    const state = DelegationState.INTERMEDIATE_WITHDRAWAL;

    const result = toLocalStorageIntermediateDelegation(
      stakingTxHashHex,
      stakerPkHex,
      finalityProviderPkHex,
      stakingValueSat,
      stakingTxHex,
      timelock,
      state,
    );

    expect(result).toEqual({
      stakingTxHashHex,
      stakerPkHex,
      finalityProviderPkHex,
      state,
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
