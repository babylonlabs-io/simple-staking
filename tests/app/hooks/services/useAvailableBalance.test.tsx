jest.mock("@/app/assets/warning-triangle.svg", () => "SVG-mock");

jest.mock("@/app/context/Error/ErrorProvider", () => ({
  useError: jest.fn(),
}));

jest.mock("@uidotdev/usehooks", () => ({
  useDebounce: jest.fn((value) => value),
}));

jest.mock("@/app/context/wallet/BTCWalletProvider", () => ({
  useBTCWallet: jest.fn(),
}));

jest.mock("@/app/context/wallet/CosmosWalletProvider", () => ({
  useCosmosWallet: jest.fn(),
}));

jest.mock("@babylonlabs-io/btc-staking-ts", () => ({
  SigningStep: {
    STAKING_SLASHING: "staking-slashing",
    UNBONDING_SLASHING: "unbonding-slashing",
    PROOF_OF_POSSESSION: "proof-of-possession",
    CREATE_BTC_DELEGATION_MSG: "create-btc-delegation-msg",
  },
}));

jest.mock("@/app/utils", () => ({
  retry: jest.fn(),
  btcToSatoshi: (value: number) => value * 100000000,
}));

import { useWatch } from "@babylonlabs-io/core-ui";
import { renderHook } from "@testing-library/react";

import { useBTCWallet } from "@/app/context/wallet/BTCWalletProvider";
import { useCosmosWallet } from "@/app/context/wallet/CosmosWalletProvider";
import { useAvailableBalance } from "@/app/hooks/services/useAvailableBalance";
import { useStakingService } from "@/app/hooks/services/useStakingService";
import { useBalanceState } from "@/app/state/BalanceState";

jest.mock("@babylonlabs-io/core-ui");
jest.mock("@/app/hooks/services/useStakingService");
jest.mock("@/app/state/BalanceState");

const ONE_BTC_IN_SATOSHI = 100000000;
const SMALL_FEE_IN_SATOSHI = 5000;
const MEDIUM_FEE_IN_SATOSHI = 10000;
const HIGH_FEE_IN_SATOSHI = 15000;
const HIGHER_FEE_IN_SATOSHI = 12000;
const TWO_BTC_IN_SATOSHI = 200000000;
const MINIMAL_BALANCE_IN_SATOSHI = 10000;
const EXPECTED_MAX_CONVERGENCE_ATTEMPTS = 10;
const MOCK_TERM_BLOCKS = 10000;
const MOCK_FEE_RATE = 5;
const FEE_INCREMENT_PER_ITERATION = 1000;
const BASE_FEE_FOR_NON_CONVERGENCE = 10000;

const ONE_BTC = 1;
const AVAILABLE_BALANCE_AFTER_SMALL_FEE = 0.99995;
const AVAILABLE_BALANCE_AFTER_MEDIUM_FEE = 0.9999;
const AVAILABLE_BALANCE_AFTER_HIGHER_FEE = 0.99988;
const MINIMAL_AVAILABLE_BALANCE = 0.00005;

describe("useAvailableBalance", () => {
  const mockCalculateFeeAmount = jest.fn();
  const mockTotalBtcBalance = ONE_BTC_IN_SATOSHI;
  const mockFeeAmountSat = SMALL_FEE_IN_SATOSHI;

  beforeEach(() => {
    jest.clearAllMocks();

    (useBalanceState as jest.Mock).mockReturnValue({
      totalBtcBalance: mockTotalBtcBalance,
    });

    (useWatch as jest.Mock).mockReturnValue(mockFeeAmountSat.toString());

    (useStakingService as jest.Mock).mockReturnValue({
      calculateFeeAmount: mockCalculateFeeAmount,
    });

    (useBTCWallet as jest.Mock).mockReturnValue({
      publicKeyNoCoord: "mock-public-key-no-coord",
      address: "mock-btc-address",
    });

    (useCosmosWallet as jest.Mock).mockReturnValue({
      bech32Address: "mock-bech32-address",
    });
  });

  describe("calculateAvailableBalance", () => {
    it("should calculate available balance correctly", () => {
      const { result } = renderHook(() => useAvailableBalance());

      const availableBalance = result.current.calculateAvailableBalance();

      expect(availableBalance).toBe(AVAILABLE_BALANCE_AFTER_SMALL_FEE);
    });

    it("should return 0 when fee exceeds total balance", () => {
      (useWatch as jest.Mock).mockReturnValue(TWO_BTC_IN_SATOSHI.toString());

      const { result } = renderHook(() => useAvailableBalance());

      const availableBalance = result.current.calculateAvailableBalance();

      expect(availableBalance).toBe(0);
    });
  });

  describe("calculateMaxStakingAmount", () => {
    const mockParams = {
      finalityProvider: "mock-finality-provider",
      term: MOCK_TERM_BLOCKS,
      feeRate: MOCK_FEE_RATE,
    };

    it("should converge to correct amount in single iteration", () => {
      mockCalculateFeeAmount.mockReturnValue(MEDIUM_FEE_IN_SATOSHI);

      const { result } = renderHook(() => useAvailableBalance());

      const maxAmount = result.current.calculateMaxStakingAmount(mockParams);

      expect(maxAmount).toBe(AVAILABLE_BALANCE_AFTER_MEDIUM_FEE);
      expect(mockCalculateFeeAmount).toHaveBeenCalledWith({
        finalityProvider: mockParams.finalityProvider,
        amount: expect.any(Number),
        term: mockParams.term,
        feeRate: mockParams.feeRate,
      });
    });

    it("should converge after multiple iterations", () => {
      mockCalculateFeeAmount
        .mockReturnValueOnce(HIGH_FEE_IN_SATOSHI)
        .mockReturnValueOnce(HIGHER_FEE_IN_SATOSHI)
        .mockReturnValueOnce(HIGHER_FEE_IN_SATOSHI);

      const { result } = renderHook(() => useAvailableBalance());

      const maxAmount = result.current.calculateMaxStakingAmount(mockParams);

      expect(maxAmount).toBe(AVAILABLE_BALANCE_AFTER_HIGHER_FEE);
      expect(mockCalculateFeeAmount).toHaveBeenCalledTimes(3);
    });

    it("should handle fee that results in zero stakable amount", () => {
      mockCalculateFeeAmount.mockReturnValue(ONE_BTC_IN_SATOSHI);

      const { result } = renderHook(() => useAvailableBalance());

      const maxAmount = result.current.calculateMaxStakingAmount(mockParams);

      expect(maxAmount).toBe(0);
    });

    it("should handle fee that exceeds total balance", () => {
      mockCalculateFeeAmount.mockReturnValue(TWO_BTC_IN_SATOSHI);

      const { result } = renderHook(() => useAvailableBalance());

      const maxAmount = result.current.calculateMaxStakingAmount(mockParams);

      expect(maxAmount).toBe(0);
    });

    it("should stop at MAX_CONVERGENCE_ATTEMPTS if not converging", () => {
      let callCount = 0;
      mockCalculateFeeAmount.mockImplementation(() => {
        callCount++;
        return (
          BASE_FEE_FOR_NON_CONVERGENCE + callCount * FEE_INCREMENT_PER_ITERATION
        );
      });

      const consoleSpy = jest.spyOn(console, "warn").mockImplementation();

      const { result } = renderHook(() => useAvailableBalance());

      result.current.calculateMaxStakingAmount(mockParams);

      expect(mockCalculateFeeAmount).toHaveBeenCalledTimes(
        EXPECTED_MAX_CONVERGENCE_ATTEMPTS,
      );
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining(
          `did not converge after ${EXPECTED_MAX_CONVERGENCE_ATTEMPTS} attempts`,
        ),
      );

      consoleSpy.mockRestore();
    });

    it("should handle very small differences and converge quickly", () => {
      mockCalculateFeeAmount
        .mockReturnValueOnce(MEDIUM_FEE_IN_SATOSHI)
        .mockReturnValueOnce(MEDIUM_FEE_IN_SATOSHI);

      const { result } = renderHook(() => useAvailableBalance());

      const maxAmount = result.current.calculateMaxStakingAmount(mockParams);

      expect(mockCalculateFeeAmount).toHaveBeenCalledTimes(2);
      expect(maxAmount).toBe(AVAILABLE_BALANCE_AFTER_MEDIUM_FEE);
    });

    it("should handle edge case with minimal balance", () => {
      (useBalanceState as jest.Mock).mockReturnValue({
        totalBtcBalance: MINIMAL_BALANCE_IN_SATOSHI,
      });

      mockCalculateFeeAmount.mockReturnValue(SMALL_FEE_IN_SATOSHI);

      const { result } = renderHook(() => useAvailableBalance());

      const maxAmount = result.current.calculateMaxStakingAmount(mockParams);

      expect(maxAmount).toBe(MINIMAL_AVAILABLE_BALANCE);
    });

    it("should handle calculateFeeAmount throwing an error", () => {
      mockCalculateFeeAmount.mockImplementation(() => {
        throw new Error("Fee calculation failed");
      });

      const { result } = renderHook(() => useAvailableBalance());

      expect(() => {
        result.current.calculateMaxStakingAmount(mockParams);
      }).toThrow("Fee calculation failed");
    });
  });

  describe("totalBalance", () => {
    it("should return total balance in BTC", () => {
      const { result } = renderHook(() => useAvailableBalance());

      expect(result.current.totalBalance).toBe(ONE_BTC);
    });
  });
});
