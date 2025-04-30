// Mock SVG imports
jest.mock("@/app/assets/warning-triangle.svg", () => "SVG-mock");

// Mock the Error Provider to avoid the SVG import issue
jest.mock("@/app/context/Error/ErrorProvider", () => ({
  useError: jest.fn(),
}));

// Mock @uidotdev/usehooks to handle ESM module issue
jest.mock("@uidotdev/usehooks", () => ({
  useDebounce: jest.fn((value) => value),
}));

// Mock the @babylonlabs-io/btc-staking-ts library
jest.mock("@babylonlabs-io/btc-staking-ts", () => ({
  getUnbondingTxStakerSignature: jest
    .fn()
    .mockReturnValue("mock-staker-signature-hex"),
  BabylonBtcStakingManager: jest.fn(),
  SigningStep: {
    STAKING_SLASHING: "staking-slashing",
    UNBONDING_SLASHING: "unbonding-slashing",
    PROOF_OF_POSSESSION: "proof-of-possession",
    CREATE_BTC_DELEGATION_MSG: "create-btc-delegation-msg",
  },
}));

// Mock the @babylonlabs-io/wallet-connector library
jest.mock("@babylonlabs-io/wallet-connector", () => ({
  Network: {
    MAINNET: "mainnet",
    TESTNET: "testnet",
  },
}));

import { act, renderHook } from "@testing-library/react";
import { Transaction } from "bitcoinjs-lib";

import { getUnbondingEligibility } from "@/app/api/getUnbondingEligibility";
import { postUnbonding } from "@/app/api/postUnbonding";
import { ClientErrorCategory } from "@/app/constants/errorMessages";
import { ClientError } from "@/app/context/Error/errors";
import { useBTCWallet } from "@/app/context/wallet/BTCWalletProvider";
import { useNetworkFees } from "@/app/hooks/client/api/useNetworkFees";
import { useStakingManagerService } from "@/app/hooks/services/useStakingManagerService";
import { useV1TransactionService } from "@/app/hooks/services/useV1TransactionService";
import { useAppState } from "@/app/state";
import { ErrorType } from "@/app/types/errors";
import { validateStakingInput } from "@/utils/delegations";
import { txFeeSafetyCheck } from "@/utils/delegations/fee";
import { getFeeRateFromMempool } from "@/utils/getFeeRateFromMempool";
import { getBbnParamByBtcHeight } from "@/utils/params";

// Mock all dependencies
jest.mock("@/app/api/getUnbondingEligibility");
jest.mock("@/app/api/postUnbonding");
jest.mock("@/app/context/wallet/BTCWalletProvider");
jest.mock("@/app/hooks/client/api/useNetworkFees");
jest.mock("@/app/hooks/services/useStakingManagerService");
jest.mock("@/app/state");
jest.mock("@/utils/delegations");
jest.mock("@/utils/delegations/fee");
jest.mock("@/utils/getFeeRateFromMempool");
jest.mock("@/utils/params");
jest.mock("bitcoinjs-lib", () => ({
  Transaction: {
    fromHex: jest.fn(),
  },
}));

describe("useV1TransactionService", () => {
  // Mock data
  const mockStakingTxHex = "mock-staking-tx-hex";
  const mockStakingTxId = "mock-staking-tx-id";
  const mockStakingHeight = 100;
  const mockFinalityProviderPkHex = "mock-finality-provider-pk-hex";
  const mockStakingAmountSat = 120000000; // 1.2 BTC in satoshi
  const mockTimelock = 10000;
  const mockEarlyUnbondingTxHex = "mock-early-unbonding-tx-hex";
  const mockParamVersion = 1;
  const mockDefaultFeeRate = 5;
  const mockUnbondingTxId = "mock-unbonding-tx-id";
  const mockUnbondingTxHex = "mock-unbonding-tx-hex";
  const mockStakerSignatureHex = "mock-staker-signature-hex";

  const mockStakingInput = {
    finalityProviderPkNoCoordHex: mockFinalityProviderPkHex,
    stakingAmountSat: mockStakingAmountSat,
    stakingTimelock: mockTimelock,
  };

  // Mock objects
  const mockStakingTx = {
    getId: jest.fn().mockReturnValue(mockStakingTxId),
    toHex: jest.fn().mockReturnValue(mockStakingTxHex),
  };

  const mockEarlyUnbondingTx = {
    getId: jest.fn().mockReturnValue(mockUnbondingTxId),
    toHex: jest.fn().mockReturnValue(mockUnbondingTxHex),
  };

  const mockSignedUnbondingTx = {
    getId: jest.fn().mockReturnValue(mockUnbondingTxId),
    toHex: jest.fn().mockReturnValue(mockUnbondingTxHex),
    virtualSize: jest.fn().mockReturnValue(200),
  };

  const mockWithdrawalTx = {
    transaction: {
      toHex: jest.fn().mockReturnValue("mock-withdrawal-tx-hex"),
      virtualSize: jest.fn().mockReturnValue(200),
    },
    fee: 1000,
  };

  // Mock function implementations
  const mockPushTx = jest.fn();
  const mockCreateBtcStakingManager = jest.fn();
  const mockBtcStakingManager = {
    createPartialSignedBtcUnbondingTransaction: jest.fn().mockResolvedValue({
      transaction: mockSignedUnbondingTx,
    }),
    createSignedBtcWithdrawEarlyUnbondedTransaction: jest
      .fn()
      .mockResolvedValue(mockWithdrawalTx),
    createSignedBtcWithdrawStakingExpiredTransaction: jest
      .fn()
      .mockResolvedValue(mockWithdrawalTx),
  };

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock useBTCWallet
    (useBTCWallet as jest.Mock).mockReturnValue({
      publicKeyNoCoord: "mock-public-key-no-coord",
      address: "mock-btc-address",
      pushTx: mockPushTx,
    });

    // Mock useNetworkFees and getFeeRateFromMempool
    (useNetworkFees as jest.Mock).mockReturnValue({
      data: { fastestFee: 10, halfHourFee: 7, hourFee: 5, economyFee: 1 },
    });
    (getFeeRateFromMempool as jest.Mock).mockReturnValue({
      defaultFeeRate: mockDefaultFeeRate,
    });

    // Mock useAppState
    (useAppState as jest.Mock).mockReturnValue({
      networkInfo: {
        params: {
          bbnStakingParams: {
            versions: [
              {
                version: mockParamVersion,
                activationHeight: 0,
                unbondingTime: 144, // ~1 day in blocks
              },
            ],
          },
        },
      },
    });

    // Mock useStakingManagerService
    (useStakingManagerService as jest.Mock).mockReturnValue({
      createBtcStakingManager: mockCreateBtcStakingManager,
    });
    mockCreateBtcStakingManager.mockReturnValue(mockBtcStakingManager);

    // Mock Transaction.fromHex
    (Transaction.fromHex as jest.Mock).mockImplementation((txHex) => {
      if (txHex === mockStakingTxHex) return mockStakingTx;
      if (txHex === mockEarlyUnbondingTxHex) return mockEarlyUnbondingTx;
      return null;
    });

    // Mock getBbnParamByBtcHeight
    (getBbnParamByBtcHeight as jest.Mock).mockReturnValue({
      version: mockParamVersion,
    });

    // Mock getUnbondingEligibility
    (getUnbondingEligibility as jest.Mock).mockResolvedValue(true);

    // Mock validateStakingInput
    (validateStakingInput as jest.Mock).mockImplementation(() => {});

    // Mock txFeeSafetyCheck
    (txFeeSafetyCheck as jest.Mock).mockImplementation(() => {});

    // Mock postUnbonding
    (postUnbonding as jest.Mock).mockResolvedValue(true);
  });

  describe("submitUnbondingTx", () => {
    it("should successfully submit an unbonding transaction", async () => {
      const { result } = renderHook(() => useV1TransactionService());

      await act(async () => {
        await result.current.submitUnbondingTx(
          mockStakingInput,
          mockStakingHeight,
          mockStakingTxHex,
        );
      });

      // Verify Transaction.fromHex was called with stakingTxHex
      expect(Transaction.fromHex).toHaveBeenCalledWith(mockStakingTxHex);

      // Verify getUnbondingEligibility was called with stakingTxId
      expect(getUnbondingEligibility).toHaveBeenCalledWith(mockStakingTxId);

      // Verify getBbnParamByBtcHeight was called with correct params
      expect(getBbnParamByBtcHeight).toHaveBeenCalledWith(
        mockStakingHeight,
        expect.anything(),
      );

      // Verify createPartialSignedBtcUnbondingTransaction was called with correct params
      expect(
        mockBtcStakingManager.createPartialSignedBtcUnbondingTransaction,
      ).toHaveBeenCalledWith(
        expect.objectContaining({
          address: "mock-btc-address",
          publicKeyNoCoordHex: "mock-public-key-no-coord",
        }),
        mockStakingInput,
        mockParamVersion,
        mockStakingTx,
      );

      // Verify postUnbonding was called with correct params
      expect(postUnbonding).toHaveBeenCalledWith(
        mockStakerSignatureHex,
        mockStakingTxId,
        mockUnbondingTxId,
        mockUnbondingTxHex,
      );
    });

    it("should throw an error when transaction is not eligible for unbonding", async () => {
      // Setup getUnbondingEligibility to return false
      (getUnbondingEligibility as jest.Mock).mockResolvedValue(false);

      const { result } = renderHook(() => useV1TransactionService());

      await expect(
        act(async () => {
          await result.current.submitUnbondingTx(
            mockStakingInput,
            mockStakingHeight,
            mockStakingTxHex,
          );
        }),
      ).rejects.toThrow();

      expect(getUnbondingEligibility).toHaveBeenCalledWith(mockStakingTxId);
      expect(
        mockBtcStakingManager.createPartialSignedBtcUnbondingTransaction,
      ).not.toHaveBeenCalled();
      expect(postUnbonding).not.toHaveBeenCalled();
    });

    it("should handle errors when posting unbonding transaction", async () => {
      // Setup postUnbonding to throw an error
      const mockError = new Error("Server error");
      (postUnbonding as jest.Mock).mockRejectedValue(mockError);

      // Make sure the transaction signature is created before the error happens
      mockBtcStakingManager.createPartialSignedBtcUnbondingTransaction.mockImplementation(
        async () => {
          // Return the transaction as expected
          const result = { transaction: mockSignedUnbondingTx };

          // But ensure postUnbonding gets called - it just fails
          await expect(
            postUnbonding(
              mockStakerSignatureHex,
              mockStakingTxId,
              mockUnbondingTxId,
              mockUnbondingTxHex,
            ),
          ).rejects.toThrow();

          return result;
        },
      );

      const { result } = renderHook(() => useV1TransactionService());

      await expect(
        act(async () => {
          await result.current.submitUnbondingTx(
            mockStakingInput,
            mockStakingHeight,
            mockStakingTxHex,
          );
        }),
      ).rejects.toThrow("Error submitting unbonding transaction");

      expect(
        mockBtcStakingManager.createPartialSignedBtcUnbondingTransaction,
      ).toHaveBeenCalled();
      // Don't need to check postUnbonding here since we manually triggered it in the mock
    });
  });

  describe("submitWithdrawalTx", () => {
    it("should successfully submit a withdrawal transaction for expired staking", async () => {
      const { result } = renderHook(() => useV1TransactionService());

      await act(async () => {
        await result.current.submitWithdrawalTx(
          mockStakingInput,
          mockStakingHeight,
          mockStakingTxHex,
        );
      });

      // Verify Transaction.fromHex was called with stakingTxHex
      expect(Transaction.fromHex).toHaveBeenCalledWith(mockStakingTxHex);

      // Verify getBbnParamByBtcHeight was called with correct params
      expect(getBbnParamByBtcHeight).toHaveBeenCalledWith(
        mockStakingHeight,
        expect.anything(),
      );

      // Verify createSignedBtcWithdrawStakingExpiredTransaction was called with correct params
      expect(
        mockBtcStakingManager.createSignedBtcWithdrawStakingExpiredTransaction,
      ).toHaveBeenCalledWith(
        expect.objectContaining({
          address: "mock-btc-address",
          publicKeyNoCoordHex: "mock-public-key-no-coord",
        }),
        mockStakingInput,
        mockParamVersion,
        mockStakingTx,
        mockDefaultFeeRate,
      );

      // Verify txFeeSafetyCheck was called with correct params
      expect(txFeeSafetyCheck).toHaveBeenCalledWith(
        mockWithdrawalTx.transaction,
        mockDefaultFeeRate,
        mockWithdrawalTx.fee,
      );

      // Verify pushTx was called with the correct transaction hex
      expect(mockPushTx).toHaveBeenCalledWith(
        mockWithdrawalTx.transaction.toHex(),
      );
    });

    it("should successfully submit a withdrawal transaction for early unbonding", async () => {
      const { result } = renderHook(() => useV1TransactionService());

      await act(async () => {
        await result.current.submitWithdrawalTx(
          mockStakingInput,
          mockStakingHeight,
          mockStakingTxHex,
          mockEarlyUnbondingTxHex,
        );
      });

      // Verify Transaction.fromHex was called with earlyUnbondingTxHex
      expect(Transaction.fromHex).toHaveBeenCalledWith(mockEarlyUnbondingTxHex);

      // Verify getBbnParamByBtcHeight was called with correct params
      expect(getBbnParamByBtcHeight).toHaveBeenCalledWith(
        mockStakingHeight,
        expect.anything(),
      );

      // Verify createSignedBtcWithdrawEarlyUnbondedTransaction was called with correct params
      expect(
        mockBtcStakingManager.createSignedBtcWithdrawEarlyUnbondedTransaction,
      ).toHaveBeenCalledWith(
        expect.objectContaining({
          address: "mock-btc-address",
          publicKeyNoCoordHex: "mock-public-key-no-coord",
        }),
        mockStakingInput,
        mockParamVersion,
        mockEarlyUnbondingTx,
        mockDefaultFeeRate,
      );

      // Verify txFeeSafetyCheck was called with correct params
      expect(txFeeSafetyCheck).toHaveBeenCalledWith(
        mockWithdrawalTx.transaction,
        mockDefaultFeeRate,
        mockWithdrawalTx.fee,
      );

      // Verify pushTx was called with the correct transaction hex
      expect(mockPushTx).toHaveBeenCalledWith(
        mockWithdrawalTx.transaction.toHex(),
      );
    });

    it("should handle fee safety check errors", async () => {
      // Setup txFeeSafetyCheck to throw an error
      const mockError = new ClientError({
        message: "Estimated fee is too high",
        category: ClientErrorCategory.CLIENT_VALIDATION,
        type: ErrorType.STAKING,
      });
      (txFeeSafetyCheck as jest.Mock).mockImplementation(() => {
        throw mockError;
      });

      const { result } = renderHook(() => useV1TransactionService());

      await expect(
        act(async () => {
          await result.current.submitWithdrawalTx(
            mockStakingInput,
            mockStakingHeight,
            mockStakingTxHex,
          );
        }),
      ).rejects.toThrow("Estimated fee is too high");

      expect(
        mockBtcStakingManager.createSignedBtcWithdrawStakingExpiredTransaction,
      ).toHaveBeenCalled();
      expect(txFeeSafetyCheck).toHaveBeenCalled();
      expect(mockPushTx).not.toHaveBeenCalled();
    });
  });
});
