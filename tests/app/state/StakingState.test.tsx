import { act, renderHook } from "@testing-library/react";
import { PropsWithChildren } from "react";

// Mock the dependencies, but keep their APIs close to real ones
const mockUseAppState = jest.fn();
jest.mock("@/ui/legacy/state", () => ({
  useAppState: () => mockUseAppState(),
}));

jest.mock("@/ui/legacy/config", () => ({
  IS_FIXED_TERM_FIELD: false,
  getDisabledWallets: () => [],
}));

const mockUseHealthCheck = jest.fn();
jest.mock("@/ui/legacy/hooks/useHealthCheck", () => ({
  useHealthCheck: () => mockUseHealthCheck(),
}));

const mockUseNetworkFees = jest.fn();
jest.mock("@/ui/legacy/hooks/client/api/useNetworkFees", () => ({
  useNetworkFees: () => mockUseNetworkFees(),
}));

const mockUseBalanceState = jest.fn();
jest.mock("@/ui/legacy/state/BalanceState", () => ({
  useBalanceState: () => mockUseBalanceState(),
}));

const mockUseBTCWallet = jest.fn();
jest.mock("@/ui/legacy/context/wallet/BTCWalletProvider", () => ({
  useBTCWallet: () => mockUseBTCWallet(),
}));

const mockUseCosmosWallet = jest.fn();
jest.mock("@/ui/legacy/context/wallet/CosmosWalletProvider", () => ({
  useCosmosWallet: () => mockUseCosmosWallet(),
}));

jest.mock("@uidotdev/usehooks", () => ({
  useDebounce: jest.fn((value) => value),
}));

// Mock useLocalStorage
const mockSetSuccessModalShown = jest.fn();
const mockSetCancelModalShown = jest.fn();
jest.mock("usehooks-ts", () => ({
  useLocalStorage: jest.fn().mockImplementation((key) => {
    if (key === "bbn-staking-successFeedbackModalOpened") {
      return [false, mockSetSuccessModalShown];
    }
    if (key === "bbn-staking-cancelFeedbackModalOpened ") {
      return [false, mockSetCancelModalShown];
    }
    return [null, jest.fn()];
  }),
}));

// Import the actual component we're testing (after mocks are defined)
import {
  StakingState,
  StakingStep,
  useStakingState,
} from "@/ui/common/state/StakingState";
import {
  DelegationV2,
  DelegationV2StakingState,
} from "@/ui/common/types/delegationsV2";

// Mock getFeeRateFromMempool
jest.mock("@/ui/legacy/utils/getFeeRateFromMempool", () => ({
  getFeeRateFromMempool: jest.fn().mockReturnValue({
    minFeeRate: 1,
    defaultFeeRate: 5,
    maxFeeRate: 10,
  }),
}));

// Create a test wrapper
const TestWrapper = ({ children }: PropsWithChildren) => (
  <StakingState>{children}</StakingState>
);

describe("StakingState", () => {
  // Mock data
  const mockNetworkInfo = {
    params: {
      bbnStakingParams: {
        latestParam: {
          minStakingAmountSat: 50000,
          maxStakingAmountSat: 1000000,
          minStakingTimeBlocks: 1000,
          maxStakingTimeBlocks: 10000,
          unbondingFeeSat: 1000,
          unbondingTime: 144,
        },
      },
    },
  };

  const mockFeeRates = {
    fastestFee: 10,
    halfHourFee: 5,
    hourFee: 1,
    economyFee: 0.5,
    minimumFee: 0.1,
  };

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock default dependency results
    mockUseAppState.mockReturnValue({
      networkInfo: mockNetworkInfo,
      isLoading: false,
      isError: false,
    });

    mockUseHealthCheck.mockReturnValue({
      isApiNormal: true,
      isGeoBlocked: false,
      apiMessage: "",
      isLoading: false,
    });

    mockUseNetworkFees.mockReturnValue({
      data: mockFeeRates,
      isLoading: false,
      isError: false,
    });

    mockUseBalanceState.mockReturnValue({
      loading: false,
      stakableBtcBalance: 500000,
    });

    mockUseBTCWallet.mockReturnValue({
      publicKeyNoCoord: "mock-public-key",
    });

    mockUseCosmosWallet.mockReturnValue({
      bech32Address: "mock-cosmos-address",
      // Potentially add disabled: [] here if needed for tests
    });
  });

  it("should provide staking state values", () => {
    const { result } = renderHook(() => useStakingState(), {
      wrapper: TestWrapper,
    });

    expect(result.current).toHaveProperty("hasError");
    expect(result.current).toHaveProperty("blocked");
    expect(result.current).toHaveProperty("available");
    expect(result.current).toHaveProperty("disabled");
    expect(result.current).toHaveProperty("loading");
    expect(result.current).toHaveProperty("processing");
    expect(result.current).toHaveProperty("stakingInfo");
    expect(result.current).toHaveProperty("formData");
    expect(result.current).toHaveProperty("goToStep");
    expect(result.current).toHaveProperty("setFormData");
    expect(result.current).toHaveProperty("setProcessing");
    expect(result.current).toHaveProperty("reset");
  });

  it("should set loading state correctly when dependencies are loading", () => {
    mockUseAppState.mockReturnValue({
      ...mockUseAppState(),
      isLoading: true,
    });

    const { result } = renderHook(() => useStakingState(), {
      wrapper: TestWrapper,
    });
    expect(result.current.loading).toBe(true);
  });

  it("should set loading state correctly when health check is loading", () => {
    mockUseHealthCheck.mockReturnValue({
      ...mockUseHealthCheck(),
      isLoading: true,
    });

    const { result } = renderHook(() => useStakingState(), {
      wrapper: TestWrapper,
    });
    expect(result.current.loading).toBe(true);
  });

  it("should set loading state correctly when network fees are loading", () => {
    mockUseNetworkFees.mockReturnValue({
      ...mockUseNetworkFees(),
      isLoading: true,
    });

    const { result } = renderHook(() => useStakingState(), {
      wrapper: TestWrapper,
    });
    expect(result.current.loading).toBe(true);
  });

  it("should set loading state correctly when balance is loading", () => {
    mockUseBalanceState.mockReturnValue({
      ...mockUseBalanceState(),
      loading: true,
    });

    const { result } = renderHook(() => useStakingState(), {
      wrapper: TestWrapper,
    });
    expect(result.current.loading).toBe(true);
  });

  it("should set hasError state correctly when app state has an error", () => {
    mockUseAppState.mockReturnValue({
      ...mockUseAppState(),
      isError: true,
    });

    const { result } = renderHook(() => useStakingState(), {
      wrapper: TestWrapper,
    });
    expect(result.current.hasError).toBe(true);
  });

  it("should set hasError state correctly when network fees have an error", () => {
    mockUseNetworkFees.mockReturnValue({
      ...mockUseNetworkFees(),
      isError: true,
    });

    const { result } = renderHook(() => useStakingState(), {
      wrapper: TestWrapper,
    });
    expect(result.current.hasError).toBe(true);
  });

  it("should set hasError state correctly when health check API is not normal", () => {
    mockUseHealthCheck.mockReturnValue({
      ...mockUseHealthCheck(),
      isApiNormal: false,
    });

    const { result } = renderHook(() => useStakingState(), {
      wrapper: TestWrapper,
    });
    expect(result.current.hasError).toBe(true);
  });

  it("should set blocked state correctly when geoblocked", () => {
    mockUseHealthCheck.mockReturnValue({
      ...mockUseHealthCheck(),
      isGeoBlocked: true,
    });

    const { result } = renderHook(() => useStakingState(), {
      wrapper: TestWrapper,
    });
    expect(result.current.blocked).toBe(true);
  });

  it("should set errorMessage correctly from health check", () => {
    const testErrorMessage = "Test API error message";
    mockUseHealthCheck.mockReturnValue({
      ...mockUseHealthCheck(),
      error: { message: testErrorMessage },
    });

    const { result } = renderHook(() => useStakingState(), {
      wrapper: TestWrapper,
    });
    expect(result.current.errorMessage).toBe(testErrorMessage);
  });

  it("should correctly calculate stakingInfo from network parameters and fee rates", () => {
    const { result } = renderHook(() => useStakingState(), {
      wrapper: TestWrapper,
    });

    expect(result.current.stakingInfo).toEqual({
      minFeeRate: 1,
      defaultFeeRate: 5,
      maxFeeRate: 10,
      minStakingAmountSat: 50000,
      maxStakingAmountSat: 1000000,
      minStakingTimeBlocks: 1000,
      maxStakingTimeBlocks: 10000,
      defaultStakingTimeBlocks: undefined, // Since IS_FIXED_TERM_FIELD is mocked to be falsy
      unbondingFeeSat: 1000,
      unbondingTime: 144,
    });
  });

  it("should handle validation schema correctly", () => {
    const { result } = renderHook(() => useStakingState(), {
      wrapper: TestWrapper,
    });

    expect(result.current.validationSchema).toBeDefined();
  });

  it("should provide goToStep function to update step", () => {
    const { result } = renderHook(() => useStakingState(), {
      wrapper: TestWrapper,
    });

    // Initial state
    expect(result.current.step).toBeUndefined();

    // Update step
    act(() => {
      result.current.goToStep(StakingStep.PREVIEW);
    });

    expect(result.current.step).toBe(StakingStep.PREVIEW);
  });

  it("should set success modal flag when going to success feedback step", () => {
    const { result } = renderHook(() => useStakingState(), {
      wrapper: TestWrapper,
    });

    act(() => {
      result.current.goToStep(StakingStep.FEEDBACK_SUCCESS);
    });

    expect(mockSetSuccessModalShown).toHaveBeenCalledWith(true);
    expect(result.current.step).toBe(StakingStep.FEEDBACK_SUCCESS);
  });

  it("should set cancel modal flag when going to cancel feedback step", () => {
    const { result } = renderHook(() => useStakingState(), {
      wrapper: TestWrapper,
    });

    act(() => {
      result.current.goToStep(StakingStep.FEEDBACK_CANCEL);
    });

    expect(mockSetCancelModalShown).toHaveBeenCalledWith(true);
    expect(result.current.step).toBe(StakingStep.FEEDBACK_CANCEL);
  });

  it("should provide setFormData function to update form data", () => {
    const { result } = renderHook(() => useStakingState(), {
      wrapper: TestWrapper,
    });

    const testFormData = {
      finalityProviders: ["test-provider"],
      term: 5000,
      amount: 100000,
      feeRate: 5,
      feeAmount: 500,
    };

    // Update form data
    act(() => {
      result.current.setFormData(testFormData);
    });

    expect(result.current.formData).toEqual(testFormData);
  });

  it("should provide setProcessing function to update processing state", () => {
    const { result } = renderHook(() => useStakingState(), {
      wrapper: TestWrapper,
    });

    // Initial state
    expect(result.current.processing).toBe(false);

    // Update processing
    act(() => {
      result.current.setProcessing(true);
    });

    expect(result.current.processing).toBe(true);
  });

  it("should provide setVerifiedDelegation function to update verified delegation", () => {
    const { result } = renderHook(() => useStakingState(), {
      wrapper: TestWrapper,
    });

    const testDelegation = {
      stakingAmount: 100000,
      stakingTxHashHex: "test-hash",
      startHeight: 100,
      state: DelegationV2StakingState.ACTIVE,
      stakingTxHex: "0x123",
      paramsVersion: 1,
      finalityProviderBtcPksHex: ["0x456"],
      stakerBtcPkHex: "0x789",
      stakingTimelock: 1000,
      endHeight: 200,
      unbondingTimelock: 1000,
      unbondingTxHex: "0xabc",
      bbnInceptionHeight: 100,
      bbnInceptionTime: "2023-01-01T00:00:00Z",
      slashing: {
        stakingSlashingTxHex: "",
        unbondingSlashingTxHex: "",
        spendingHeight: 0,
      },
    };

    // Initial state
    expect(result.current.verifiedDelegation).toBeUndefined();

    // Update verified delegation
    act(() => {
      result.current.setVerifiedDelegation(testDelegation);
    });

    expect(result.current.verifiedDelegation).toEqual(testDelegation);
  });

  it("should provide reset function to reset all state values", () => {
    const { result } = renderHook(() => useStakingState(), {
      wrapper: TestWrapper,
    });

    // Set some state values
    act(() => {
      result.current.goToStep(StakingStep.PREVIEW);
      result.current.setFormData({
        finalityProviders: ["test-provider"],
        term: 5000,
        amount: 100000,
        feeRate: 5,
        feeAmount: 500,
      });
      result.current.setProcessing(true);
      result.current.setVerifiedDelegation({
        stakingAmount: 100000,
        stakingTxHashHex: "test-hash",
        startHeight: 100,
        state: DelegationV2StakingState.ACTIVE,
        stakingTxHex: "0x123",
        paramsVersion: 1,
        finalityProviderBtcPksHex: ["0x456"],
        stakerBtcPkHex: "0x789",
        stakingTimelock: 1000,
        endHeight: 200,
        unbondingTimelock: 1000,
        unbondingTxHex: "0xabc",
        bbnInceptionHeight: 100,
        bbnInceptionTime: "2023-01-01T00:00:00Z",
        slashing: {
          stakingSlashingTxHex: "",
          unbondingSlashingTxHex: "",
          spendingHeight: 0,
        },
      });
    });

    // Reset
    act(() => {
      result.current.reset();
    });

    // Check reset state
    expect(result.current.step).toBeUndefined();
    expect(result.current.formData).toBeUndefined();
    expect(result.current.processing).toBe(false);
    expect(result.current.verifiedDelegation).toBeUndefined();
  });

  // State transition tests
  describe("state transitions", () => {
    it("should transition between steps using goToStep", () => {
      const { result } = renderHook(() => useStakingState(), {
        wrapper: TestWrapper,
      });

      // Initial state should have no step
      expect(result.current.step).toBeUndefined();

      // Transition to PREVIEW step
      act(() => {
        result.current.goToStep(StakingStep.PREVIEW);
      });
      expect(result.current.step).toBe(StakingStep.PREVIEW);

      // Transition to EOI_STAKING_SLASHING step
      act(() => {
        result.current.goToStep(StakingStep.EOI_STAKING_SLASHING);
      });
      expect(result.current.step).toBe(StakingStep.EOI_STAKING_SLASHING);

      // Transition to VERIFYING step
      act(() => {
        result.current.goToStep(StakingStep.VERIFYING);
      });
      expect(result.current.step).toBe(StakingStep.VERIFYING);
    });

    it("should set processing state correctly", () => {
      const { result } = renderHook(() => useStakingState(), {
        wrapper: TestWrapper,
      });

      // Initial processing state should be false
      expect(result.current.processing).toBe(false);

      // Set processing to true
      act(() => {
        result.current.setProcessing(true);
      });
      expect(result.current.processing).toBe(true);

      // Set processing back to false
      act(() => {
        result.current.setProcessing(false);
      });
      expect(result.current.processing).toBe(false);
    });

    it("should update form data correctly", () => {
      const { result } = renderHook(() => useStakingState(), {
        wrapper: TestWrapper,
      });

      const initialFormData = result.current.formData;
      const newFormData = {
        finalityProviders: ["test-provider"],
        amount: 100000,
        term: 5000,
        feeRate: 5,
        feeAmount: 1000,
      };

      // Update form data
      act(() => {
        result.current.setFormData(newFormData);
      });

      // Check that form data was updated
      expect(result.current.formData).toEqual(newFormData);
      expect(result.current.formData).not.toEqual(initialFormData);

      // Clear form data
      act(() => {
        result.current.setFormData(undefined);
      });

      // Form data should be undefined
      expect(result.current.formData).toBeUndefined();
    });

    it("should update verified delegation correctly", () => {
      const { result } = renderHook(() => useStakingState(), {
        wrapper: TestWrapper,
      });

      // Initial verified delegation should be undefined
      expect(result.current.verifiedDelegation).toBeUndefined();

      const mockDelegation: DelegationV2 = {
        stakingAmount: 100000,
        stakingTxHashHex: "mock-hash",
        stakingTxHex: "mock-tx-hex",
        paramsVersion: 1,
        finalityProviderBtcPksHex: ["mock-fp-pk"],
        stakerBtcPkHex: "mock-staker-pk",
        stakingTimelock: 5000,
        bbnInceptionHeight: 100,
        bbnInceptionTime: "2023-01-01",
        startHeight: 101,
        endHeight: 5101,
        unbondingTimelock: 144,
        unbondingTxHex: "mock-unbonding-tx",
        state: DelegationV2StakingState.VERIFIED,
        slashing: {
          stakingSlashingTxHex: "mock-slashing-tx",
          unbondingSlashingTxHex: "mock-unbonding-slashing-tx",
          spendingHeight: 200,
        },
      };

      // Set verified delegation
      act(() => {
        result.current.setVerifiedDelegation(mockDelegation);
      });

      // Check that verified delegation was set
      expect(result.current.verifiedDelegation).toEqual(mockDelegation);

      // Clear verified delegation
      act(() => {
        result.current.setVerifiedDelegation(undefined);
      });

      // Verified delegation should be undefined
      expect(result.current.verifiedDelegation).toBeUndefined();
    });

    it("should reset the state correctly", () => {
      const { result } = renderHook(() => useStakingState(), {
        wrapper: TestWrapper,
      });

      // Set up a non-default state
      const newFormData = {
        finalityProviders: ["test-provider"],
        amount: 100000,
        term: 5000,
        feeRate: 5,
        feeAmount: 1000,
      };

      const mockDelegation: DelegationV2 = {
        stakingAmount: 100000,
        stakingTxHashHex: "mock-hash",
        stakingTxHex: "mock-tx-hex",
        paramsVersion: 1,
        finalityProviderBtcPksHex: ["mock-fp-pk"],
        stakerBtcPkHex: "mock-staker-pk",
        stakingTimelock: 5000,
        bbnInceptionHeight: 100,
        bbnInceptionTime: "2023-01-01",
        startHeight: 101,
        endHeight: 5101,
        unbondingTimelock: 144,
        unbondingTxHex: "mock-unbonding-tx",
        state: DelegationV2StakingState.VERIFIED,
        slashing: {
          stakingSlashingTxHex: "mock-slashing-tx",
          unbondingSlashingTxHex: "mock-unbonding-slashing-tx",
          spendingHeight: 200,
        },
      };

      act(() => {
        result.current.goToStep(StakingStep.VERIFYING);
        result.current.setProcessing(true);
        result.current.setFormData(newFormData);
        result.current.setVerifiedDelegation(mockDelegation);
      });

      // Verify non-default state
      expect(result.current.step).toBe(StakingStep.VERIFYING);
      expect(result.current.processing).toBe(true);
      expect(result.current.formData).toEqual(newFormData);
      expect(result.current.verifiedDelegation).toEqual(mockDelegation);

      // Reset the state
      act(() => {
        result.current.reset();
      });

      // Verify state was reset
      expect(result.current.step).toBeUndefined();
      expect(result.current.processing).toBe(false);
      expect(result.current.formData).toBeUndefined();
      expect(result.current.verifiedDelegation).toBeUndefined();
    });
  });

  describe("state transitions with workflow sequences", () => {
    it("should handle a complete staking workflow", async () => {
      const { result } = renderHook(() => useStakingState(), {
        wrapper: TestWrapper,
      });

      // Step 1: Fill the form
      const stakingFormData = {
        finalityProviders: ["test-provider"],
        amount: 100000,
        term: 5000,
        feeRate: 5,
        feeAmount: 1000,
      };

      act(() => {
        result.current.setFormData(stakingFormData);
      });
      expect(result.current.formData).toEqual(stakingFormData);

      // Step 2: Go to preview
      act(() => {
        result.current.goToStep(StakingStep.PREVIEW);
      });
      expect(result.current.step).toBe(StakingStep.PREVIEW);

      // Step 3: Go through EOI screens
      act(() => {
        result.current.goToStep(StakingStep.EOI_STAKING_SLASHING);
      });
      expect(result.current.step).toBe(StakingStep.EOI_STAKING_SLASHING);

      act(() => {
        result.current.goToStep(StakingStep.EOI_UNBONDING_SLASHING);
      });
      expect(result.current.step).toBe(StakingStep.EOI_UNBONDING_SLASHING);

      act(() => {
        result.current.goToStep(StakingStep.EOI_PROOF_OF_POSSESSION);
      });
      expect(result.current.step).toBe(StakingStep.EOI_PROOF_OF_POSSESSION);

      act(() => {
        result.current.goToStep(StakingStep.EOI_SIGN_BBN);
      });
      expect(result.current.step).toBe(StakingStep.EOI_SIGN_BBN);

      // Step 4: Start staking transaction process
      act(() => {
        result.current.goToStep(StakingStep.EOI_SEND_BBN);
        result.current.setProcessing(true);
      });
      expect(result.current.step).toBe(StakingStep.EOI_SEND_BBN);
      expect(result.current.processing).toBe(true);

      // Step 5: Transaction sent, waiting for verification
      act(() => {
        result.current.goToStep(StakingStep.VERIFYING);
      });
      expect(result.current.step).toBe(StakingStep.VERIFYING);

      // Step 6: Verified delegation received
      const mockDelegation: DelegationV2 = {
        stakingAmount: stakingFormData.amount,
        stakingTxHashHex: "mock-hash",
        stakingTxHex: "mock-tx-hex",
        paramsVersion: 1,
        finalityProviderBtcPksHex: stakingFormData.finalityProviders,
        stakerBtcPkHex: "mock-staker-pk",
        stakingTimelock: stakingFormData.term,
        bbnInceptionHeight: 100,
        bbnInceptionTime: "2023-01-01",
        startHeight: 101,
        endHeight: 101 + stakingFormData.term,
        unbondingTimelock: 144,
        unbondingTxHex: "mock-unbonding-tx",
        state: DelegationV2StakingState.VERIFIED,
        slashing: {
          stakingSlashingTxHex: "mock-slashing-tx",
          unbondingSlashingTxHex: "mock-unbonding-slashing-tx",
          spendingHeight: 200,
        },
      };

      act(() => {
        result.current.setVerifiedDelegation(mockDelegation);
        result.current.goToStep(StakingStep.VERIFIED);
        result.current.setProcessing(false);
      });

      expect(result.current.verifiedDelegation).toEqual(mockDelegation);
      expect(result.current.step).toBe(StakingStep.VERIFIED);
      expect(result.current.processing).toBe(false);

      // Step 7: Show success feedback
      act(() => {
        result.current.goToStep(StakingStep.FEEDBACK_SUCCESS);
      });
      expect(result.current.step).toBe(StakingStep.FEEDBACK_SUCCESS);

      // Step 8: Reset everything for a new staking
      act(() => {
        result.current.reset();
      });

      expect(result.current.step).toBeUndefined();
      expect(result.current.processing).toBe(false);
      expect(result.current.formData).toBeUndefined();
      expect(result.current.verifiedDelegation).toBeUndefined();
    });

    it("should handle a cancelled staking workflow", () => {
      const { result } = renderHook(() => useStakingState(), {
        wrapper: TestWrapper,
      });

      // Step 1: Fill the form
      const stakingFormData = {
        finalityProviders: ["test-provider"],
        amount: 100000,
        term: 5000,
        feeRate: 5,
        feeAmount: 1000,
      };

      act(() => {
        result.current.setFormData(stakingFormData);
      });

      // Step 2: Go to preview
      act(() => {
        result.current.goToStep(StakingStep.PREVIEW);
      });

      // Step 3: Decide to cancel
      act(() => {
        result.current.goToStep(StakingStep.FEEDBACK_CANCEL);
      });
      expect(result.current.step).toBe(StakingStep.FEEDBACK_CANCEL);

      // Step 4: Reset
      act(() => {
        result.current.reset();
      });

      expect(result.current.step).toBeUndefined();
      expect(result.current.formData).toBeUndefined();
    });
  });
});
