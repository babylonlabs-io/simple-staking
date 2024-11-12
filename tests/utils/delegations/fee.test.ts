import { txFeeSafetyCheck } from "@/utils/delegations/fee";

describe("txFeeSafetyCheck", () => {
  const feeRate = Math.floor(Math.random() * 100) + 1;
  const tx: any = {
    virtualSize: jest.fn(),
  };
  beforeEach(() => {
    const randomVirtualSize = Math.floor(Math.random() * 1000) + 1;
    tx.virtualSize.mockReturnValue(randomVirtualSize);
  });

  test("should not throw an error if the estimated fee is within the acceptable range", () => {
    let estimatedFee = (tx.virtualSize() * feeRate) / 2 + 1;
    expect(() => {
      txFeeSafetyCheck(tx, feeRate, estimatedFee);
    }).not.toThrow();

    estimatedFee = tx.virtualSize() * feeRate * 2 - 1;
    expect(() => {
      txFeeSafetyCheck(tx, feeRate, estimatedFee);
    }).not.toThrow();
  });

  test("should throw an error if the estimated fee is too high", () => {
    const estimatedFee = tx.virtualSize() * feeRate * 2 + 1;

    expect(() => {
      txFeeSafetyCheck(tx, feeRate, estimatedFee);
    }).toThrow("Estimated fee is too high");
  });

  test("should throw an error if the estimated fee is too low", () => {
    const estimatedFee = (tx.virtualSize() * feeRate) / 2 - 1;

    expect(() => {
      txFeeSafetyCheck(tx, feeRate, estimatedFee);
    }).toThrow("Estimated fee is too low");
  });

  test("should not throw an error if the estimated fee is exactly within the boundary", () => {
    let estimatedFee = (tx.virtualSize() * feeRate) / 2;
    expect(() => {
      txFeeSafetyCheck(tx, feeRate, estimatedFee);
    }).not.toThrow();

    estimatedFee = tx.virtualSize() * feeRate * 2;
    expect(() => {
      txFeeSafetyCheck(tx, feeRate, estimatedFee);
    }).not.toThrow();
  });
});
