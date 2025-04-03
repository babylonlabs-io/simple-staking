import { act, renderHook } from "@testing-library/react";
import { PropsWithChildren } from "react";

// Mock the dependencies, but keep their APIs close to real ones
const mockUseAppState = jest.fn();
jest.mock("@/app/state", () => ({
  useAppState: () => mockUseAppState(),
}));

const mockUseHealthCheck = jest.fn();
jest.mock("@/app/hooks/useHealthCheck", () => ({
  useHealthCheck: () => mockUseHealthCheck(),
}));

const mockUseNetworkFees = jest.fn();
jest.mock("@/app/hooks/client/api/useNetworkFees", () => ({
  useNetworkFees: () => mockUseNetworkFees(),
}));

const mockUseBalanceState = jest.fn();
jest.mock("@/app/state/BalanceState", () => ({
  useBalanceState: () => mockUseBalanceState(),
}));

const mockUseBTCWallet = jest.fn();
jest.mock("@/app/context/wallet/BTCWalletProvider", () => ({
  useBTCWallet: () => mockUseBTCWallet(),
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
} from "@/app/state/StakingState";
import { DelegationV2StakingState } from "@/app/types/delegationsV2";

// Mock getFeeRateFromMempool
jest.mock("@/utils/getFeeRateFromMempool", () => ({
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
    stakingStatus: { isStakingOpen: true },
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

  it("should set available state correctly when staking is open", () => {
    mockUseAppState.mockReturnValue({
      ...mockUseAppState(),
      networkInfo: {
        ...mockNetworkInfo,
        stakingStatus: { isStakingOpen: true },
      },
    });

    const { result } = renderHook(() => useStakingState(), {
      wrapper: TestWrapper,
    });
    expect(result.current.available).toBe(true);
  });

  it("should set available state correctly when staking is closed", () => {
    mockUseAppState.mockReturnValue({
      ...mockUseAppState(),
      networkInfo: {
        ...mockNetworkInfo,
        stakingStatus: { isStakingOpen: false },
      },
    });

    const { result } = renderHook(() => useStakingState(), {
      wrapper: TestWrapper,
    });
    expect(result.current.available).toBe(false);
  });

  it("should set errorMessage from health check apiMessage", () => {
    const testErrorMessage = "Test API error message";
    mockUseHealthCheck.mockReturnValue({
      ...mockUseHealthCheck(),
      apiMessage: testErrorMessage,
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
      finalityProvider: "test-provider",
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
        finalityProvider: "test-provider",
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
});
