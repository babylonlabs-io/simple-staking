import { act, renderHook } from "@testing-library/react";
import { PropsWithChildren } from "react";
import * as hooks from "usehooks-ts";

// Mock the dependencies, but keep their APIs close to real ones
const mockUseBTCWallet = jest.fn();
jest.mock("@/ui/common/context/wallet/BTCWalletProvider", () => ({
  useBTCWallet: () => mockUseBTCWallet(),
}));

const mockUseDelegations = jest.fn();
jest.mock("@/ui/common/hooks/client/api/useDelegations", () => ({
  useDelegations: () => mockUseDelegations(),
}));

// Mock useLocalStorage
const mockSetDelegations = jest.fn();
jest.mock("usehooks-ts", () => ({
  useLocalStorage: jest.fn().mockImplementation(() => {
    return [[], mockSetDelegations];
  }),
}));

// Mock calculateDelegationsDiff
const mockCalculateDelegationsDiff = jest.fn();
jest.mock("@/ui/common/utils/local_storage/calculateDelegationsDiff", () => ({
  calculateDelegationsDiff: (...args: any[]) =>
    mockCalculateDelegationsDiff(...args),
}));

// Import the actual component we're testing (after mocks are defined)
import {
  DelegationState,
  useDelegationState,
} from "@/ui/common/state/DelegationState";
import { DelegationState as DelegationStateEnum } from "@/ui/common/types/delegations";

// Create a test wrapper
const TestWrapper = ({ children }: PropsWithChildren) => (
  <DelegationState>{children}</DelegationState>
);

describe("DelegationState", () => {
  // Mock data
  const mockDelegation1 = {
    stakingTxHashHex: "hash1",
    stakerPkHex: "staker1",
    finalityProviderPkHex: "fp1",
    state: DelegationStateEnum.ACTIVE,
    stakingValueSat: 100000,
    stakingTx: {
      txHex: "tx1",
      outputIndex: 0,
      startTimestamp: "2023-01-01T00:00:00Z",
      startHeight: 100,
      timelock: 1000,
    },
    unbondingTx: undefined,
    isOverflow: false,
    isEligibleForTransition: false,
  };

  const mockDelegation2 = {
    stakingTxHashHex: "hash2",
    stakerPkHex: "staker1",
    finalityProviderPkHex: "fp2",
    state: DelegationStateEnum.UNBONDING,
    stakingValueSat: 200000,
    stakingTx: {
      txHex: "tx2",
      outputIndex: 0,
      startTimestamp: "2023-01-02T00:00:00Z",
      startHeight: 200,
      timelock: 1000,
    },
    unbondingTx: {
      txHex: "tx3",
      outputIndex: 0,
    },
    isOverflow: false,
    isEligibleForTransition: false,
  };

  const mockApiDelegationsResponse = {
    delegations: [mockDelegation1, mockDelegation2],
    pagination: { next_key: "" },
  };

  const mockRefetch = jest.fn();
  const mockFetchNextPage = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock default dependency results
    mockUseBTCWallet.mockReturnValue({
      publicKeyNoCoord: "mock-public-key",
    });

    mockUseDelegations.mockReturnValue({
      data: mockApiDelegationsResponse,
      isFetchingNextPage: false,
      hasNextPage: false,
      fetchNextPage: mockFetchNextPage,
      refetch: mockRefetch,
    });

    mockCalculateDelegationsDiff.mockResolvedValue({
      areDelegationsDifferent: true,
      delegations: [mockDelegation1, mockDelegation2],
    });
  });

  it("should provide delegation state values", () => {
    const { result } = renderHook(() => useDelegationState(), {
      wrapper: TestWrapper,
    });

    expect(result.current).toHaveProperty("isLoading");
    expect(result.current).toHaveProperty("hasMoreDelegations");
    expect(result.current).toHaveProperty("delegations");
    expect(result.current).toHaveProperty("processing");
    expect(result.current).toHaveProperty("registrationStep");
    expect(result.current).toHaveProperty("selectedDelegation");
    expect(result.current).toHaveProperty("addDelegation");
    expect(result.current).toHaveProperty("fetchMoreDelegations");
    expect(result.current).toHaveProperty("setRegistrationStep");
    expect(result.current).toHaveProperty("setProcessing");
    expect(result.current).toHaveProperty("setSelectedDelegation");
    expect(result.current).toHaveProperty("resetRegistration");
    expect(result.current).toHaveProperty("refetch");
  });

  it("should set loading state from useDelegations", () => {
    mockUseDelegations.mockReturnValue({
      ...mockUseDelegations(),
      isFetchingNextPage: true,
    });

    const { result } = renderHook(() => useDelegationState(), {
      wrapper: TestWrapper,
    });
    expect(result.current.isLoading).toBe(true);
  });

  it("should set hasMoreDelegations from useDelegations", () => {
    mockUseDelegations.mockReturnValue({
      ...mockUseDelegations(),
      hasNextPage: true,
    });

    const { result } = renderHook(() => useDelegationState(), {
      wrapper: TestWrapper,
    });
    expect(result.current.hasMoreDelegations).toBe(true);
  });

  it("should sync delegations from API to local storage when data changes", async () => {
    // This is a bit tricky to test since useEffect is involved, but we can check if calculateDelegationsDiff is called
    renderHook(() => useDelegationState(), { wrapper: TestWrapper });

    // Wait for useEffect to run
    await Promise.resolve();

    expect(mockCalculateDelegationsDiff).toHaveBeenCalledWith(
      mockApiDelegationsResponse.delegations,
      [],
    );
  });

  it("should allow adding a delegation", () => {
    const { result } = renderHook(() => useDelegationState(), {
      wrapper: TestWrapper,
    });

    const newDelegation = { ...mockDelegation1, stakingTxHashHex: "hash3" };

    act(() => {
      result.current.addDelegation(newDelegation);
    });

    expect(mockSetDelegations).toHaveBeenCalled();
  });

  it("should not add duplicate delegations", () => {
    // Setup: mock that delegations already exist in local storage
    const existingDelegations = [mockDelegation1];
    jest
      .spyOn(hooks as any, "useLocalStorage")
      .mockImplementationOnce(() => [existingDelegations, mockSetDelegations]);

    const { result } = renderHook(() => useDelegationState(), {
      wrapper: TestWrapper,
    });

    // Attempt to add the same delegation again
    act(() => {
      result.current.addDelegation(mockDelegation1);
    });

    // The setter should be called with a function that returns the original array
    const setterFn = mockSetDelegations.mock.calls[0][0];
    const newDelegations = setterFn(existingDelegations);
    expect(newDelegations).toBe(existingDelegations);
  });

  it("should provide fetchMoreDelegations method", () => {
    const { result } = renderHook(() => useDelegationState(), {
      wrapper: TestWrapper,
    });

    result.current.fetchMoreDelegations();
    expect(mockFetchNextPage).toHaveBeenCalled();
  });

  it("should provide setRegistrationStep method", () => {
    const { result } = renderHook(() => useDelegationState(), {
      wrapper: TestWrapper,
    });

    // Initial state
    expect(result.current.registrationStep).toBeUndefined();

    // Update registration step
    act(() => {
      result.current.setRegistrationStep("registration-start");
    });

    expect(result.current.registrationStep).toBe("registration-start");
  });

  it("should provide setProcessing method", () => {
    const { result } = renderHook(() => useDelegationState(), {
      wrapper: TestWrapper,
    });

    // Initial state
    expect(result.current.processing).toBe(false);

    // Update processing flag
    act(() => {
      result.current.setProcessing(true);
    });

    expect(result.current.processing).toBe(true);
  });

  it("should provide setSelectedDelegation method", () => {
    const { result } = renderHook(() => useDelegationState(), {
      wrapper: TestWrapper,
    });

    // Initial state
    expect(result.current.selectedDelegation).toBeUndefined();

    // Update selected delegation
    act(() => {
      result.current.setSelectedDelegation(mockDelegation1);
    });

    expect(result.current.selectedDelegation).toBe(mockDelegation1);
  });

  it("should provide resetRegistration method to reset registration state", () => {
    const { result } = renderHook(() => useDelegationState(), {
      wrapper: TestWrapper,
    });

    // Set up some registration state
    act(() => {
      result.current.setRegistrationStep("registration-start");
      result.current.setProcessing(true);
      result.current.setSelectedDelegation(mockDelegation1);
    });

    // Reset
    act(() => {
      result.current.resetRegistration();
    });

    // Check reset state
    expect(result.current.registrationStep).toBeUndefined();
    expect(result.current.processing).toBe(false);
    expect(result.current.selectedDelegation).toBeUndefined();
  });

  it("should provide refetch method", () => {
    const { result } = renderHook(() => useDelegationState(), {
      wrapper: TestWrapper,
    });

    result.current.refetch();
    expect(mockRefetch).toHaveBeenCalled();
  });

  it("should handle case when API data is undefined", async () => {
    mockUseDelegations.mockReturnValue({
      ...mockUseDelegations(),
      data: undefined,
    });

    renderHook(() => useDelegationState(), { wrapper: TestWrapper });

    // Wait for useEffect to run
    await Promise.resolve();

    // calculateDelegationsDiff should not be called since data is undefined
    expect(mockCalculateDelegationsDiff).not.toHaveBeenCalled();
  });
});
