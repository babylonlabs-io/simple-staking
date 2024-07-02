import { isStakingSignReady } from "@/utils/isStakingSignReady";

describe("utils/isStakingSignReady", () => {
  it("should return false with reason if fpSelected is false", () => {
    const result = isStakingSignReady(1, 2, 3, 4, 5, 6, false);
    expect(result.isReady).toBe(false);
    expect(result.reason).toBe("Please select a finality provider");
  });

  it("should return false with reason if amount is not ready", () => {
    const notReadyAmountInputs = [
      {
        minAmount: 0,
        maxAmount: 0,
        amount: 0,
      },
      {
        minAmount: 0,
        maxAmount: 0,
        amount: 1,
      },
      {
        minAmount: 1,
        maxAmount: 0,
        amount: 0,
      },
      {
        minAmount: 1,
        maxAmount: 9,
        amount: 10,
      },
      {
        minAmount: 4,
        maxAmount: 10,
        amount: 3,
      },
    ];
    notReadyAmountInputs.forEach((input) => {
      const result = isStakingSignReady(
        input.minAmount,
        input.maxAmount,
        3,
        4,
        input.amount,
        6,
        true,
      );
      expect(result.isReady).toBe(false);
      expect(result.reason).toBe("Please enter a valid stake amount");
    });
  });

  it("should return false with reason if time is not ready", () => {
    const notReadyTimeInputs = [
      {
        minTime: 0,
        maxTime: 0,
        time: 0,
      },
      {
        minTime: 0,
        maxTime: 0,
        time: 1,
      },
      {
        minTime: 1,
        maxTime: 0,
        time: 0,
      },
      {
        minTime: 1,
        maxTime: 9,
        time: 10,
      },
      {
        minTime: 4,
        maxTime: 10,
        time: 3,
      },
    ];
    notReadyTimeInputs.forEach((input) => {
      const result = isStakingSignReady(
        1,
        10,
        input.minTime,
        input.maxTime,
        5,
        input.time,
        true,
      );
      expect(result.isReady).toBe(false);
      expect(result.reason).toBe("Please enter a valid staking period");
    });
  });

  it("should return true with empty reason if amount and time are ready", () => {
    const result = isStakingSignReady(1, 10, 20, 30, 5, 25, true);
    expect(result.isReady).toBe(true);
    expect(result.reason).toBe("");
  });
});
