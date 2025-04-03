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

import { SigningStep } from "@babylonlabs-io/btc-staking-ts";
import { act, renderHook } from "@testing-library/react";

import { getDelegationV2 } from "@/app/api/getDelegationsV2";
import { useError } from "@/app/context/Error/ErrorProvider";
import { useBTCWallet } from "@/app/context/wallet/BTCWalletProvider";
import { useCosmosWallet } from "@/app/context/wallet/CosmosWalletProvider";
import { useBbnTransaction } from "@/app/hooks/client/rpc/mutation/useBbnTransaction";
import { useStakingService } from "@/app/hooks/services/useStakingService";
import { useTransactionService } from "@/app/hooks/services/useTransactionService";
import { useDelegationV2State } from "@/app/state/DelegationV2State";
import { StakingStep, useStakingState } from "@/app/state/StakingState";
import {
  DelegationV2,
  DelegationV2StakingState,
} from "@/app/types/delegationsV2";
import { retry } from "@/utils";

// Mock all dependencies
jest.mock("@/app/api/getDelegationsV2");
jest.mock("@/app/context/Error/ErrorProvider");
jest.mock("@/app/context/wallet/BTCWalletProvider");
jest.mock("@/app/context/wallet/CosmosWalletProvider");
jest.mock("@/app/hooks/services/useTransactionService");
jest.mock("@/app/hooks/client/rpc/mutation/useBbnTransaction");
jest.mock("@/app/state/DelegationV2State");
jest.mock("@/app/state/StakingState");
jest.mock("@/utils", () => ({
  retry: jest.fn(),
  btcToSatoshi: (value: number) => value * 100000000, // Mock satoshi conversion
}));

// Mock the SigningStep enum from the library like in the other test
jest.mock("@babylonlabs-io/btc-staking-ts", () => ({
  SigningStep: {
    STAKING_SLASHING: "staking-slashing",
    UNBONDING_SLASHING: "unbonding-slashing",
    PROOF_OF_POSSESSION: "proof-of-possession",
    CREATE_BTC_DELEGATION_MSG: "create-btc-delegation-msg",
  },
}));

describe("useStakingService", () => {
  // Mock data
  const mockFormData = {
    finalityProvider: "mock-finality-provider",
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
  const mockHandleError = jest.fn();

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

    // Mock useError
    (useError as jest.Mock).mockReturnValue({
      handleError: mockHandleError,
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
    (retry as jest.Mock).mockImplementation((fn, predicate, interval) => {
      return fn();
    });

    // Setup success response for createDelegationEoi
    mockCreateDelegationEoi.mockResolvedValue({
      stakingTxHash: mockStakingTxHash,
      signedBabylonTx: mockSignedBabylonTx,
    });
  });

  describe("calculateFeeAmount", () => {
    it("should calculate fee amount correctly", () => {
      const { result } = renderHook(() => useStakingService());

      const fee = result.current.calculateFeeAmount({
        finalityProvider: mockFormData.finalityProvider,
        amount: mockFormData.amount,
        term: mockFormData.term,
        feeRate: mockFormData.feeRate,
      });

      // Verify estimateStakingFee was called correctly
      expect(mockEstimateStakingFee).toHaveBeenCalledWith(
        {
          finalityProviderPkNoCoordHex: mockFormData.finalityProvider,
          stakingAmountSat: mockAmountSat,
          stakingTimelock: mockFormData.term,
          feeRate: mockFormData.feeRate,
        },
        mockFormData.feeRate,
      );

      expect(fee).toBe(5000);
    });

    it("should handle errors and return 0", () => {
      mockEstimateStakingFee.mockImplementation(() => {
        throw new Error("Test error");
      });

      const { result } = renderHook(() => useStakingService());

      const fee = result.current.calculateFeeAmount({
        finalityProvider: mockFormData.finalityProvider,
        amount: mockFormData.amount,
        term: mockFormData.term,
        feeRate: mockFormData.feeRate,
      });

      expect(fee).toBe(0);
    });
  });

  describe("displayPreview", () => {
    it("should set form data and go to preview step", () => {
      const { result } = renderHook(() => useStakingService());

      result.current.displayPreview(mockFormData);

      expect(mockSetFormData).toHaveBeenCalledWith(mockFormData);
      expect(mockGoToStep).toHaveBeenCalledWith(StakingStep.PREVIEW);
    });
  });

  describe("createEOI", () => {
    it("should handle successful EOI creation and delegation", async () => {
      const { result } = renderHook(() => useStakingService());

      await act(async () => {
        await result.current.createEOI(mockFormData);
      });

      // Verify correct steps are taken
      expect(mockSetProcessing).toHaveBeenCalledWith(true);

      expect(mockCreateDelegationEoi).toHaveBeenCalledWith(
        {
          finalityProviderPkNoCoordHex: mockFormData.finalityProvider,
          stakingAmountSat: mockFormData.amount,
          stakingTimelock: mockFormData.term,
          feeRate: mockFormData.feeRate,
        },
        mockFormData.feeRate,
      );

      expect(mockGoToStep).toHaveBeenCalledWith(StakingStep.EOI_SEND_BBN);
      expect(mockSendBbnTx).toHaveBeenCalledWith(mockSignedBabylonTx);

      expect(mockAddDelegation).toHaveBeenCalledWith({
        stakingAmount: mockFormData.amount,
        stakingTxHashHex: mockStakingTxHash,
        startHeight: 0,
        state: DelegationV2StakingState.INTERMEDIATE_PENDING_VERIFICATION,
      });

      expect(mockGoToStep).toHaveBeenCalledWith(StakingStep.VERIFYING);

      expect(getDelegationV2).toHaveBeenCalledWith(mockStakingTxHash);
      expect(mockSetVerifiedDelegation).toHaveBeenCalledWith(mockDelegation);
      expect(mockRefetchDelegations).toHaveBeenCalled();
      expect(mockGoToStep).toHaveBeenCalledWith(StakingStep.VERIFIED);
      expect(mockSetProcessing).toHaveBeenCalledWith(false);
    });

    it("should handle errors during EOI creation", async () => {
      // Setup error response for createDelegationEoi
      const mockError = new Error("Failed to create EOI");
      mockCreateDelegationEoi.mockRejectedValue(mockError);

      const { result } = renderHook(() => useStakingService());

      await act(async () => {
        await result.current.createEOI(mockFormData);
      });

      expect(mockSetProcessing).toHaveBeenCalledWith(true);
      expect(mockHandleError).toHaveBeenCalledWith({
        error: mockError,
        metadata: {
          userPublicKey: "mock-public-key-no-coord",
          btcAddress: "mock-btc-address",
          babylonAddress: "mock-bech32-address",
        },
      });
      expect(mockReset).toHaveBeenCalled();
    });
  });

  describe("stakeDelegation", () => {
    it("should handle successful delegation staking", async () => {
      const { result } = renderHook(() => useStakingService());

      await act(async () => {
        await result.current.stakeDelegation(mockDelegation);
      });

      expect(mockSetProcessing).toHaveBeenCalledWith(true);

      expect(mockSubmitStakingTx).toHaveBeenCalledWith(
        {
          finalityProviderPkNoCoordHex:
            mockDelegation.finalityProviderBtcPksHex[0],
          stakingAmountSat: mockDelegation.stakingAmount,
          stakingTimelock: mockDelegation.stakingTimelock,
        },
        mockDelegation.paramsVersion,
        mockDelegation.stakingTxHashHex,
        mockDelegation.stakingTxHex,
      );

      expect(mockUpdateDelegationStatus).toHaveBeenCalledWith(
        mockDelegation.stakingTxHashHex,
        DelegationV2StakingState.INTERMEDIATE_PENDING_BTC_CONFIRMATION,
      );

      expect(mockReset).toHaveBeenCalled();
      expect(mockGoToStep).toHaveBeenCalledWith(StakingStep.FEEDBACK_SUCCESS);
    });

    it("should handle errors during delegation staking", async () => {
      // Setup error response for submitStakingTx
      const mockError = new Error("Failed to submit staking transaction");
      mockSubmitStakingTx.mockRejectedValue(mockError);

      const { result } = renderHook(() => useStakingService());

      await act(async () => {
        await result.current.stakeDelegation(mockDelegation);
      });

      expect(mockSetProcessing).toHaveBeenCalledWith(true);
      expect(mockReset).toHaveBeenCalled();
      expect(mockHandleError).toHaveBeenCalledWith({
        error: mockError,
        displayOptions: {
          retryAction: expect.any(Function),
        },
        metadata: {
          stakingTxHash: mockDelegation.stakingTxHashHex,
          userPublicKey: "mock-public-key-no-coord",
          btcAddress: "mock-btc-address",
          babylonAddress: "mock-bech32-address",
        },
      });
    });
  });

  describe("subscribeToSigningSteps", () => {
    it("should subscribe to signing steps and update current step", () => {
      const mockCallback = jest.fn();

      // Mock the implementation of subscribeToSigningSteps
      mockSubscribeToSigningSteps.mockImplementation((callback) => {
        mockCallback.mockImplementation(callback);
        return () => {};
      });

      renderHook(() => useStakingService());

      // Verify subscription was registered
      expect(mockSubscribeToSigningSteps).toHaveBeenCalled();

      // Simulate a signing step event
      mockCallback(SigningStep.STAKING_SLASHING);

      // Verify the step was updated
      expect(mockGoToStep).toHaveBeenCalledWith(
        StakingStep.EOI_STAKING_SLASHING,
      );
    });
  });
});
