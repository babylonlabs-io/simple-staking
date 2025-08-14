// Mock SVG imports
jest.mock("@/ui/common/assets/warning-triangle.svg", () => "SVG-mock");

// Mock the Error Provider
const mockHandleError = jest.fn();
jest.mock("@/ui/common/context/Error/ErrorProvider", () => ({
  useError: () => ({
    handleError: mockHandleError,
  }),
  ERROR_SOURCES: {
    ORDINALS: "ORDINALS_ERROR",
  },
}));

// Mock @uidotdev/usehooks to handle ESM module issue
jest.mock("@uidotdev/usehooks", () => ({
  useDebounce: jest.fn((value) => value),
}));

// Import after mocks
import { act, renderHook } from "@testing-library/react";
import { PropsWithChildren } from "react";

import { getDelegationV2 } from "@/ui/common/api/getDelegationsV2";
import { HttpStatusCode } from "@/ui/common/api/httpStatusCodes";
import { ClientErrorCategory } from "@/ui/common/constants/errorMessages";
import { useError } from "@/ui/common/context/Error/ErrorProvider";
import { ClientError } from "@/ui/common/context/Error/errors/clientError";
import { ServerError } from "@/ui/common/context/Error/errors/serverError";
import { useBTCWallet } from "@/ui/common/context/wallet/BTCWalletProvider";
import { useCosmosWallet } from "@/ui/common/context/wallet/CosmosWalletProvider";
import { useBbnTransaction } from "@/ui/common/hooks/client/rpc/mutation/useBbnTransaction";
import { useStakingService } from "@/ui/common/hooks/services/useStakingService";
import { useTransactionService } from "@/ui/common/hooks/services/useTransactionService";
import { useDelegationV2State } from "@/ui/common/state/DelegationV2State";
import { StakingStep, useStakingState } from "@/ui/common/state/StakingState";
import {
  DelegationV2,
  DelegationV2StakingState,
} from "@/ui/common/types/delegationsV2";
import { ErrorType } from "@/ui/common/types/errors";
import { retry } from "@/ui/common/utils";

// Mock all dependencies
jest.mock("@/ui/common/api/getDelegationsV2");
jest.mock("@/ui/common/context/wallet/BTCWalletProvider");
jest.mock("@/ui/common/context/wallet/CosmosWalletProvider");
jest.mock("@/ui/common/hooks/services/useTransactionService");
jest.mock("@/ui/common/hooks/client/rpc/mutation/useBbnTransaction");
jest.mock("@/ui/common/state/DelegationV2State");
jest.mock("@/ui/common/state/StakingState");
jest.mock("@/ui/common/utils", () => ({
  retry: jest.fn(),
  btcToSatoshi: (value: number) => value * 100000000, // Mock satoshi conversion
}));

// Mock the SigningStep enum from the library
jest.mock("@babylonlabs-io/btc-staking-ts", () => ({
  SigningStep: {
    STAKING_SLASHING: "staking-slashing",
    UNBONDING_SLASHING: "unbonding-slashing",
    PROOF_OF_POSSESSION: "proof-of-possession",
    CREATE_BTC_DELEGATION_MSG: "create-btc-delegation-msg",
  },
}));

// Create a test wrapper
const TestWrapper = ({ children }: PropsWithChildren) => <>{children}</>;

// Mock data for tests
const mockFormData = {
  finalityProviders: ["mock-finality-provider"],
  amount: 1.2, // BTC
  term: 10000, // blocks
  feeRate: 5,
  feeAmount: 5000, // satoshi
};

const mockAmountSat = 120000000; // 1.2 BTC in satoshi
const mockStakingTxHash = "mock-staking-tx-hash";
const mockSignedBabylonTx = "mock-signed-babylon-tx";

const mockDelegation: DelegationV2 = {
  stakingAmount: mockAmountSat,
  stakingTxHashHex: mockStakingTxHash,
  startHeight: 100,
  state: DelegationV2StakingState.VERIFIED,
  stakingTxHex: "mock-staking-tx-hex",
  paramsVersion: 1,
  finalityProviderBtcPksHex: ["mock-finality-provider"],
  stakerBtcPkHex: "mock-staker-btc-pk",
  stakingTimelock: 10000,
  bbnInceptionHeight: 100,
  bbnInceptionTime: new Date().toISOString(),
  endHeight: 200,
  unbondingTimelock: 1000,
  unbondingTxHex: "mock-unbonding-tx-hex",
  slashing: {
    stakingSlashingTxHex: "",
    unbondingSlashingTxHex: "",
    spendingHeight: 0,
  },
};

// Mock function implementations
const mockSetFormData = jest.fn();
const mockGoToStep = jest.fn();
const mockSetProcessing = jest.fn();
const mockSetVerifiedDelegation = jest.fn();
const mockReset = jest.fn();
const mockSendBbnTx = jest.fn();
const mockRefetchDelegations = jest.fn();
const mockAddDelegation = jest.fn();
const mockUpdateDelegationStatus = jest.fn();
const mockEstimateStakingFee = jest.fn().mockReturnValue(5000);
const mockCreateDelegationEoi = jest.fn();
const mockSubmitStakingTx = jest.fn();
const mockSubscribeToSigningSteps = jest.fn();

describe("Core Services Error Handling", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Mock useStakingState
    (useStakingState as jest.Mock).mockReturnValue({
      setFormData: mockSetFormData,
      goToStep: mockGoToStep,
      setProcessing: mockSetProcessing,
      setVerifiedDelegation: mockSetVerifiedDelegation,
      reset: mockReset,
    });

    // Mock useBbnTransaction
    (useBbnTransaction as jest.Mock).mockReturnValue({
      sendBbnTx: mockSendBbnTx,
    });

    // Mock useDelegationV2State
    (useDelegationV2State as jest.Mock).mockReturnValue({
      refetch: mockRefetchDelegations,
      addDelegation: mockAddDelegation,
      updateDelegationStatus: mockUpdateDelegationStatus,
    });

    // Mock useTransactionService
    (useTransactionService as jest.Mock).mockReturnValue({
      estimateStakingFee: mockEstimateStakingFee,
      createDelegationEoi: mockCreateDelegationEoi,
      submitStakingTx: mockSubmitStakingTx,
      subscribeToSigningSteps: mockSubscribeToSigningSteps,
    });

    // Mock wallet hooks
    (useBTCWallet as jest.Mock).mockReturnValue({
      publicKeyNoCoord: "mock-public-key-no-coord",
      address: "mock-btc-address",
    });

    (useCosmosWallet as jest.Mock).mockReturnValue({
      bech32Address: "mock-bech32-address",
    });

    // Mock getDelegationV2 API call
    (getDelegationV2 as jest.Mock).mockResolvedValue(mockDelegation);

    // Mock retry utility
    (retry as jest.Mock).mockImplementation((fn) => {
      return fn();
    });
  });

  describe("useStakingService Error Handling", () => {
    it("should handle client errors in createEOI", async () => {
      // Set up the client error
      const clientError = new ClientError({
        message: "Insufficient funds for staking",
        category: ClientErrorCategory.CLIENT_VALIDATION,
        type: ErrorType.STAKING,
      });

      // Make createDelegationEoi throw the client error
      mockCreateDelegationEoi.mockRejectedValue(clientError);

      const { result } = renderHook(() => useStakingService(), {
        wrapper: TestWrapper,
      });

      // Try to create an EOI which will fail
      await act(async () => {
        await result.current.createEOI(mockFormData);
      });

      // Verify error handling
      expect(mockHandleError).toHaveBeenCalledWith({
        error: clientError,
        metadata: {
          userPublicKey: "mock-public-key-no-coord",
          btcAddress: "mock-btc-address",
          babylonAddress: "mock-bech32-address",
        },
      });

      // Verify that the reset function was called to clean up the state
      expect(mockReset).toHaveBeenCalled();

      // Verify processing state was set to true then false after error
      expect(mockSetProcessing).toHaveBeenCalledWith(true);
    });

    it("should handle server errors in createEOI", async () => {
      // Set up the server error
      const serverError = new ServerError({
        message: "API request failed",
        status: HttpStatusCode.BadGateway,
        endpoint: "/api/delegations",
        request: { data: "request data" },
        response: { error: "Server error" },
      });

      // Make sendBbnTx throw the server error
      mockSendBbnTx.mockRejectedValue(serverError);
      mockCreateDelegationEoi.mockResolvedValue({
        stakingTxHash: mockStakingTxHash,
        signedBabylonTx: mockSignedBabylonTx,
      });

      const { result } = renderHook(() => useStakingService(), {
        wrapper: TestWrapper,
      });

      // Try to create an EOI which will fail at the sendBbnTx step
      await act(async () => {
        await result.current.createEOI(mockFormData);
      });

      // Verify error handling
      expect(mockHandleError).toHaveBeenCalledWith({
        error: serverError,
        metadata: {
          userPublicKey: "mock-public-key-no-coord",
          btcAddress: "mock-btc-address",
          babylonAddress: "mock-bech32-address",
        },
      });

      // Verify that the reset function was called to clean up the state
      expect(mockReset).toHaveBeenCalled();
    });

    it("should handle errors in getDelegationV2 API call", async () => {
      // Set up createDelegationEoi to succeed
      mockCreateDelegationEoi.mockResolvedValue({
        stakingTxHash: mockStakingTxHash,
        signedBabylonTx: mockSignedBabylonTx,
      });

      // Make sendBbnTx succeed
      mockSendBbnTx.mockResolvedValue({});

      // Make the retry function throw an error
      const apiError = new Error("Failed to fetch delegation");
      (retry as jest.Mock).mockRejectedValue(apiError);

      const { result } = renderHook(() => useStakingService(), {
        wrapper: TestWrapper,
      });

      // Try to create an EOI which will fail at the get delegation step
      await act(async () => {
        await result.current.createEOI(mockFormData);
      });

      // Verify error handling
      expect(mockHandleError).toHaveBeenCalledWith({
        error: apiError,
        metadata: {
          userPublicKey: "mock-public-key-no-coord",
          btcAddress: "mock-btc-address",
          babylonAddress: "mock-bech32-address",
        },
      });

      // Verify that the reset function was called to clean up the state
      expect(mockReset).toHaveBeenCalled();
    });

    it("should handle errors in stakeDelegation with retry action", async () => {
      // Set up the error
      const stakingError = new Error("Failed to submit staking transaction");
      mockSubmitStakingTx.mockRejectedValue(stakingError);

      const { result } = renderHook(() => useStakingService(), {
        wrapper: TestWrapper,
      });

      // Try to stake a delegation which will fail
      await act(async () => {
        await result.current.stakeDelegation(mockDelegation);
      });

      // Verify error handling with retry action
      expect(mockHandleError).toHaveBeenCalledWith(
        expect.objectContaining({
          error: stakingError,
          displayOptions: expect.objectContaining({
            retryAction: expect.any(Function),
          }),
          metadata: {
            userPublicKey: "mock-public-key-no-coord",
            btcAddress: "mock-btc-address",
            babylonAddress: "mock-bech32-address",
            stakingTxHash: mockStakingTxHash,
          },
        }),
      );

      // Verify that the reset function was called
      expect(mockReset).toHaveBeenCalled();

      // Test that retry action works correctly
      const retryAction =
        mockHandleError.mock.calls[0][0].displayOptions.retryAction;

      // Reset the mocks
      jest.clearAllMocks();
      mockSubmitStakingTx.mockResolvedValue({}); // Make it succeed this time

      // Execute the retry action
      await act(async () => {
        await retryAction();
      });

      // Verify that stakeDelegation was called again
      expect(mockSubmitStakingTx).toHaveBeenCalledWith(
        {
          finalityProviderPksNoCoordHex:
            mockDelegation.finalityProviderBtcPksHex,
          stakingAmountSat: mockDelegation.stakingAmount,
          stakingTimelock: mockDelegation.stakingTimelock,
        },
        mockDelegation.paramsVersion,
        mockDelegation.stakingTxHashHex,
        mockDelegation.stakingTxHex,
      );

      // Verify status update was called on success
      expect(mockUpdateDelegationStatus).toHaveBeenCalledWith(
        mockDelegation.stakingTxHashHex,
        DelegationV2StakingState.INTERMEDIATE_PENDING_BTC_CONFIRMATION,
      );

      // Verify UI was updated correctly
      expect(mockReset).toHaveBeenCalled();
      expect(mockGoToStep).toHaveBeenCalledWith(StakingStep.FEEDBACK_SUCCESS);
    });

    it("should include error category and type in the client error metadata", async () => {
      // Set up a client error with specific category and type
      const clientError = new ClientError({
        message: "Invalid staking amount",
        category: ClientErrorCategory.CLIENT_VALIDATION,
        type: ErrorType.STAKING,
      });

      // Make createDelegationEoi throw the client error
      mockCreateDelegationEoi.mockRejectedValue(clientError);

      const { result } = renderHook(() => useStakingService(), {
        wrapper: TestWrapper,
      });

      // Try to create an EOI which will fail
      await act(async () => {
        await result.current.createEOI(mockFormData);
      });

      // Verify error handling with correct error category and type
      expect(mockHandleError).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.objectContaining({
            category: ClientErrorCategory.CLIENT_VALIDATION,
            type: ErrorType.STAKING,
            message: "Invalid staking amount",
          }),
        }),
      );
    });

    it("should include HTTP status and endpoint in server error metadata", async () => {
      // Set up the server error with specific status and endpoint
      const serverError = new ServerError({
        message: "API request failed",
        status: HttpStatusCode.NotFound,
        endpoint: "/api/delegations/v2",
        request: { txHash: "mock-hash" },
        response: { error: "Delegation not found" },
      });

      // Make sendBbnTx throw the server error
      mockSendBbnTx.mockRejectedValue(serverError);
      mockCreateDelegationEoi.mockResolvedValue({
        stakingTxHash: mockStakingTxHash,
        signedBabylonTx: mockSignedBabylonTx,
      });

      const { result } = renderHook(() => useStakingService(), {
        wrapper: TestWrapper,
      });

      // Try to create an EOI which will fail at the sendBbnTx step
      await act(async () => {
        await result.current.createEOI(mockFormData);
      });

      // Verify error handling includes correct HTTP status and endpoint
      expect(mockHandleError).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.objectContaining({
            status: HttpStatusCode.NotFound,
            endpoint: "/api/delegations/v2",
            type: ErrorType.SERVER,
          }),
        }),
      );
    });
  });

  describe("Error Handling with Display Options", () => {
    beforeEach(() => {
      // Clear mock before each test
      mockHandleError.mockClear();
    });

    it("should pass silent error handling options to handleError", () => {
      // Create a component that uses the error handler
      const { result } = renderHook(() => {
        const { handleError } = useError();
        return { handleError };
      });

      // Create an error
      const silentError = new Error("Ordinals processing error");

      // Call handleError with showModal: false
      act(() => {
        result.current.handleError({
          error: silentError,
          displayOptions: {
            showModal: false,
          },
          metadata: {
            errorSource: "ORDINALS_ERROR",
          },
        });
      });

      // Verify mockHandleError was called with the correct parameters
      expect(mockHandleError).toHaveBeenCalledWith({
        error: silentError,
        displayOptions: {
          showModal: false,
        },
        metadata: {
          errorSource: "ORDINALS_ERROR",
        },
      });
    });

    it("should pass retry action options to handleError", () => {
      // Create a component that uses the error handler
      const { result } = renderHook(() => {
        const { handleError } = useError();
        return { handleError };
      });

      // Create an error
      const retryableError = new Error("Temporary network issue");
      const mockRetryAction = jest.fn();

      // Call handleError with retry action
      act(() => {
        result.current.handleError({
          error: retryableError,
          displayOptions: {
            retryAction: mockRetryAction,
            noCancel: true,
          },
        });
      });

      // Verify mockHandleError was called with the correct parameters
      expect(mockHandleError).toHaveBeenCalledWith({
        error: retryableError,
        displayOptions: {
          retryAction: mockRetryAction,
          noCancel: true,
        },
      });
    });
  });
});
