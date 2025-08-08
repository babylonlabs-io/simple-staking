// Mock SVG imports
jest.mock("@/ui/common/assets/warning-triangle.svg", () => "SVG-mock");

// Mock the Error Provider to avoid the SVG import issue
jest.mock("@/ui/common/context/Error/ErrorProvider", () => ({
  useError: jest.fn(),
}));

// Mock @uidotdev/usehooks to handle ESM module issue
jest.mock("@uidotdev/usehooks", () => ({
  useDebounce: jest.fn((value) => value),
}));

import { RegistrationStep } from "@babylonlabs-io/btc-staking-ts";
import { act, renderHook } from "@testing-library/react";

import { getDelegationV2 } from "@/ui/common/api/getDelegationsV2";
import { ONE_SECOND } from "@/ui/common/constants";
import { useError } from "@/ui/common/context/Error/ErrorProvider";
import { ClientError } from "@/ui/common/errors";
import { useBbnTransaction } from "@/ui/common/hooks/client/rpc/mutation/useBbnTransaction";
import { useRegistrationService } from "@/ui/common/hooks/services/useRegistrationService";
import { useTransactionService } from "@/ui/common/hooks/services/useTransactionService";
import { useDelegationState } from "@/ui/common/state/DelegationState";
import { useDelegationV2State } from "@/ui/common/state/DelegationV2State";
import { Delegation } from "@/ui/common/types/delegations";
import {
  DelegationV2,
  DelegationV2StakingState,
} from "@/ui/common/types/delegationsV2";
import { retry } from "@/ui/common/utils";

// Mock all dependencies
jest.mock("@/ui/common/api/getDelegationsV2");
jest.mock("@/ui/common/constants", () => ({
  ONE_SECOND: 1000,
}));
jest.mock("@/ui/common/hooks/client/rpc/mutation/useBbnTransaction");
jest.mock("@/ui/common/hooks/services/useTransactionService");
jest.mock("@/ui/common/state/DelegationState");
jest.mock("@/ui/common/state/DelegationV2State");
jest.mock("@/ui/common/utils", () => ({
  retry: jest.fn(),
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

describe("useRegistrationService", () => {
  // Mock data
  const mockStakingTxHashHex = "mock-staking-tx-hash";
  const mockStakingTxHex = "mock-staking-tx-hex";
  const mockStartHeight = 100;
  const mockFinalityProviderPkHex = "mock-finality-provider-pk-hex";
  const mockStakingValueSat = 120000000; // 1.2 BTC in satoshi
  const mockTimelock = 10000;
  const mockSignedBabylonTx = "mock-signed-babylon-tx";

  const mockSelectedDelegation: Delegation = {
    stakingTxHashHex: mockStakingTxHashHex,
    stakerPkHex: "mock-staker-pk-hex",
    finalityProviderPkHex: mockFinalityProviderPkHex,
    state: "active",
    stakingValueSat: mockStakingValueSat,
    stakingTx: {
      txHex: mockStakingTxHex,
      outputIndex: 0,
      startTimestamp: new Date().toISOString(),
      startHeight: mockStartHeight,
      timelock: mockTimelock,
    },
    unbondingTx: undefined,
    isOverflow: false,
    isEligibleForTransition: true,
  };

  const mockDelegationV2: DelegationV2 = {
    stakingAmount: mockStakingValueSat,
    stakingTxHashHex: mockStakingTxHashHex,
    startHeight: mockStartHeight,
    state: DelegationV2StakingState.ACTIVE,
    stakingTxHex: mockStakingTxHex,
    paramsVersion: 1,
    finalityProviderBtcPksHex: [mockFinalityProviderPkHex],
    stakerBtcPkHex: "mock-staker-btc-pk",
    stakingTimelock: mockTimelock,
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
  const mockSetRegistrationStep = jest.fn();
  const mockSetProcessing = jest.fn();
  const mockResetRegistration = jest.fn();
  const mockRefetchV1Delegations = jest.fn();
  const mockTransitionPhase1Delegation = jest.fn();
  const mockSubscribeToSigningSteps = jest.fn();
  const mockAddDelegation = jest.fn();
  const mockRefetchV2Delegations = jest.fn();
  const mockSendBbnTx = jest.fn();
  const mockHandleError = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock useDelegationState
    (useDelegationState as jest.Mock).mockReturnValue({
      setRegistrationStep: mockSetRegistrationStep,
      setProcessing: mockSetProcessing,
      selectedDelegation: mockSelectedDelegation,
      resetRegistration: mockResetRegistration,
      refetch: mockRefetchV1Delegations,
    });

    // Mock useTransactionService
    (useTransactionService as jest.Mock).mockReturnValue({
      transitionPhase1Delegation: mockTransitionPhase1Delegation,
      subscribeToSigningSteps: mockSubscribeToSigningSteps,
    });

    // Mock useDelegationV2State
    (useDelegationV2State as jest.Mock).mockReturnValue({
      addDelegation: mockAddDelegation,
      refetch: mockRefetchV2Delegations,
    });

    // Mock useBbnTransaction
    (useBbnTransaction as jest.Mock).mockReturnValue({
      sendBbnTx: mockSendBbnTx,
    });

    // Mock useError
    (useError as jest.Mock).mockReturnValue({
      handleError: mockHandleError,
    });

    // Mock getDelegationV2 API call
    (getDelegationV2 as jest.Mock).mockResolvedValue(mockDelegationV2);

    // Mock retry utility
    (retry as jest.Mock).mockImplementation((fn) => {
      return fn();
    });

    // Setup success response for transitionPhase1Delegation
    mockTransitionPhase1Delegation.mockResolvedValue({
      stakingTxHash: mockStakingTxHashHex,
      signedBabylonTx: mockSignedBabylonTx,
    });
  });

  describe("subscribeToSigningSteps", () => {
    it("should subscribe to signing steps and update registration step", () => {
      // Initialize callback to avoid linter error
      let callback = jest.fn() as unknown as (step: RegistrationStep) => void;

      // Mock the implementation of subscribeToSigningSteps
      mockSubscribeToSigningSteps.mockImplementation((cb) => {
        callback = cb;
        return () => {};
      });

      // Render the hook
      renderHook(() => useRegistrationService());

      // Verify subscription was registered
      expect(mockSubscribeToSigningSteps).toHaveBeenCalled();

      // Simulate different signing step events
      callback("staking-slashing");
      expect(mockSetRegistrationStep).toHaveBeenCalledWith(
        "registration-staking-slashing",
        undefined,
      );

      callback("unbonding-slashing");
      expect(mockSetRegistrationStep).toHaveBeenCalledWith(
        "registration-unbonding-slashing",
        undefined,
      );

      callback("proof-of-possession");
      expect(mockSetRegistrationStep).toHaveBeenCalledWith(
        "registration-proof-of-possession",
        undefined,
      );

      callback("create-btc-delegation-msg");
      expect(mockSetRegistrationStep).toHaveBeenCalledWith(
        "registration-sign-bbn",
        undefined,
      );
    });
  });

  describe("registerPhase1Delegation", () => {
    it("should handle error when no delegation is selected", async () => {
      // Setup with no selectedDelegation
      (useDelegationState as jest.Mock).mockReturnValue({
        setRegistrationStep: mockSetRegistrationStep,
        setProcessing: mockSetProcessing,
        selectedDelegation: undefined,
        resetRegistration: mockResetRegistration,
        refetch: mockRefetchV1Delegations,
      });

      const { result } = renderHook(() => useRegistrationService());

      await act(async () => {
        await result.current.registerPhase1Delegation();
      });

      expect(mockSetRegistrationStep).toHaveBeenCalledWith(
        "registration-staking-slashing",
      );
      expect(mockHandleError).toHaveBeenCalledWith({
        error: expect.any(ClientError),
      });
      expect(mockHandleError.mock.calls[0][0].error.message).toBe(
        "No delegation selected for registration",
      );
    });

    it("should successfully register a phase 1 delegation", async () => {
      const { result } = renderHook(() => useRegistrationService());

      await act(async () => {
        await result.current.registerPhase1Delegation();
      });

      // Verify initial steps
      expect(mockSetRegistrationStep).toHaveBeenCalledWith(
        "registration-staking-slashing",
      );
      expect(mockSetProcessing).toHaveBeenCalledWith(true);

      // Verify transitionPhase1Delegation was called with correct params
      expect(mockTransitionPhase1Delegation).toHaveBeenCalledWith(
        mockStakingTxHex,
        mockStartHeight,
        {
          finalityProviderPksNoCoordHex: [mockFinalityProviderPkHex],
          stakingAmountSat: mockStakingValueSat,
          stakingTimelock: mockTimelock,
        },
      );

      // Verify Babylon transaction is sent
      expect(mockSetRegistrationStep).toHaveBeenCalledWith(
        "registration-send-bbn",
      );
      expect(mockSendBbnTx).toHaveBeenCalledWith(mockSignedBabylonTx);

      // Verify delegation is added
      expect(mockAddDelegation).toHaveBeenCalledWith({
        stakingAmount: mockStakingValueSat,
        stakingTxHashHex: mockStakingTxHashHex,
        startHeight: mockStartHeight,
        state: DelegationV2StakingState.INTERMEDIATE_PENDING_VERIFICATION,
      });

      // Verify verification steps
      expect(mockSetRegistrationStep).toHaveBeenCalledWith(
        "registration-verifying",
      );
      expect(getDelegationV2).toHaveBeenCalledWith(mockStakingTxHashHex);

      // Verify final steps
      expect(mockSetRegistrationStep).toHaveBeenCalledWith(
        "registration-verified",
      );
      expect(mockRefetchV1Delegations).toHaveBeenCalled();
      expect(mockRefetchV2Delegations).toHaveBeenCalled();
      expect(mockSetProcessing).toHaveBeenCalledWith(false);
    });

    it("should handle errors during delegation registration", async () => {
      // Setup error response for transitionPhase1Delegation
      const mockError = new Error("Failed to transition delegation");
      mockTransitionPhase1Delegation.mockRejectedValue(mockError);

      const { result } = renderHook(() => useRegistrationService());

      await act(async () => {
        await result.current.registerPhase1Delegation();
      });

      expect(mockSetRegistrationStep).toHaveBeenCalledWith(
        "registration-staking-slashing",
      );
      expect(mockSetProcessing).toHaveBeenCalledWith(true);
      expect(mockHandleError).toHaveBeenCalledWith({
        error: mockError,
      });
      expect(mockResetRegistration).toHaveBeenCalled();
    });

    it("should handle successful validation but wait for active state", async () => {
      // Mock retry to simulate waiting for active state
      (retry as jest.Mock).mockImplementation((_, predicate) => {
        // First call returns pending, second call returns active
        const pendingDelegation = {
          ...mockDelegationV2,
          state: DelegationV2StakingState.PENDING,
        };

        // Test the predicate
        if (!predicate(pendingDelegation)) {
          // If predicate fails (delegation not active), return pending
          return pendingDelegation;
        }

        // If predicate passes, return active delegation
        return mockDelegationV2;
      });

      const { result } = renderHook(() => useRegistrationService());

      await act(async () => {
        await result.current.registerPhase1Delegation();
      });

      expect(retry).toHaveBeenCalledWith(
        expect.any(Function),
        expect.any(Function),
        ONE_SECOND * 5,
      );

      expect(mockSetRegistrationStep).toHaveBeenCalledWith(
        "registration-verified",
      );
      expect(mockRefetchV1Delegations).toHaveBeenCalled();
      expect(mockRefetchV2Delegations).toHaveBeenCalled();
    });
  });
});
