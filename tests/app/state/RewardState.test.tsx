import { act, renderHook } from "@testing-library/react";
import { PropsWithChildren } from "react";

// Mock the dependencies, but keep their APIs close to real ones
const mockUseCosmosWallet = jest.fn();
jest.mock("@/ui/common/context/wallet/CosmosWalletProvider", () => ({
  useCosmosWallet: () => mockUseCosmosWallet(),
}));

const mockUseBbnQuery = jest.fn();
jest.mock("@/ui/common/hooks/client/rpc/queries/useBbnQuery", () => ({
  useBbnQuery: () => mockUseBbnQuery(),
}));

// Import the actual component we're testing (after mocks are defined)
import { RewardsState, useRewardsState } from "@/ui/common/state/RewardState";

// Create a test wrapper
const TestWrapper = ({ children }: PropsWithChildren) => (
  <RewardsState>{children}</RewardsState>
);

describe("RewardState", () => {
  // Mock data
  const mockBbnAddress = "bbn1234567890abcdef";
  const mockRewardBalance = 5000000; // 5 BBN
  const mockRefetchRewardBalance = jest.fn().mockResolvedValue(undefined);

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock default dependency results
    mockUseCosmosWallet.mockReturnValue({
      bech32Address: mockBbnAddress,
    });

    mockUseBbnQuery.mockReturnValue({
      rewardsQuery: {
        data: mockRewardBalance,
        isLoading: false,
        refetch: mockRefetchRewardBalance,
      },
    });
  });

  it("should provide reward state values", () => {
    const { result } = renderHook(() => useRewardsState(), {
      wrapper: TestWrapper,
    });

    expect(result.current).toHaveProperty("loading");
    expect(result.current).toHaveProperty("showRewardModal");
    expect(result.current).toHaveProperty("showProcessingModal");
    expect(result.current).toHaveProperty("processing");
    expect(result.current).toHaveProperty("bbnAddress");
    expect(result.current).toHaveProperty("rewardBalance");
    expect(result.current).toHaveProperty("transactionFee");
    expect(result.current).toHaveProperty("transactionHash");
    expect(result.current).toHaveProperty("setTransactionHash");
    expect(result.current).toHaveProperty("setTransactionFee");
    expect(result.current).toHaveProperty("openRewardModal");
    expect(result.current).toHaveProperty("closeRewardModal");
    expect(result.current).toHaveProperty("openProcessingModal");
    expect(result.current).toHaveProperty("closeProcessingModal");
    expect(result.current).toHaveProperty("setProcessing");
    expect(result.current).toHaveProperty("refetchRewardBalance");
  });

  it("should set loading state from rewardsQuery", () => {
    mockUseBbnQuery.mockReturnValue({
      rewardsQuery: {
        ...mockUseBbnQuery().rewardsQuery,
        isLoading: true,
      },
    });

    const { result } = renderHook(() => useRewardsState(), {
      wrapper: TestWrapper,
    });
    expect(result.current.loading).toBe(true);
  });

  it("should get bbnAddress from useCosmosWallet", () => {
    const { result } = renderHook(() => useRewardsState(), {
      wrapper: TestWrapper,
    });
    expect(result.current.bbnAddress).toBe(mockBbnAddress);
  });

  it("should get rewardBalance from rewardsQuery", () => {
    const { result } = renderHook(() => useRewardsState(), {
      wrapper: TestWrapper,
    });
    expect(result.current.rewardBalance).toBe(mockRewardBalance);
  });

  it("should handle undefined rewardBalance", () => {
    mockUseBbnQuery.mockReturnValue({
      rewardsQuery: {
        ...mockUseBbnQuery().rewardsQuery,
        data: undefined,
      },
    });

    const { result } = renderHook(() => useRewardsState(), {
      wrapper: TestWrapper,
    });
    expect(result.current.rewardBalance).toBe(0);
  });

  it("should provide openRewardModal and closeRewardModal methods", () => {
    const { result } = renderHook(() => useRewardsState(), {
      wrapper: TestWrapper,
    });

    // Initial state
    expect(result.current.showRewardModal).toBe(false);

    // Open modal
    act(() => {
      result.current.openRewardModal();
    });

    expect(result.current.showRewardModal).toBe(true);

    // Close modal
    act(() => {
      result.current.closeRewardModal();
    });

    expect(result.current.showRewardModal).toBe(false);
  });

  it("should provide openProcessingModal and closeProcessingModal methods", () => {
    const { result } = renderHook(() => useRewardsState(), {
      wrapper: TestWrapper,
    });

    // Initial state
    expect(result.current.showProcessingModal).toBe(false);

    // Open modal
    act(() => {
      result.current.openProcessingModal();
    });

    expect(result.current.showProcessingModal).toBe(true);

    // Close modal
    act(() => {
      result.current.closeProcessingModal();
    });

    expect(result.current.showProcessingModal).toBe(false);
  });

  it("should provide setProcessing method", () => {
    const { result } = renderHook(() => useRewardsState(), {
      wrapper: TestWrapper,
    });

    // Initial state
    expect(result.current.processing).toBe(false);

    // Set processing
    act(() => {
      result.current.setProcessing(true);
    });

    expect(result.current.processing).toBe(true);
  });

  it("should provide setTransactionFee method", () => {
    const { result } = renderHook(() => useRewardsState(), {
      wrapper: TestWrapper,
    });

    // Initial state
    expect(result.current.transactionFee).toBe(0);

    // Set transaction fee
    const testFee = 12345;
    act(() => {
      result.current.setTransactionFee(testFee);
    });

    expect(result.current.transactionFee).toBe(testFee);
  });

  it("should provide setTransactionHash method", () => {
    const { result } = renderHook(() => useRewardsState(), {
      wrapper: TestWrapper,
    });

    // Initial state
    expect(result.current.transactionHash).toBe("");

    // Set transaction hash
    const testHash = "0x1234567890abcdef";
    act(() => {
      result.current.setTransactionHash(testHash);
    });

    expect(result.current.transactionHash).toBe(testHash);
  });

  it("should provide refetchRewardBalance method that calls rewardsQuery.refetch", async () => {
    const { result } = renderHook(() => useRewardsState(), {
      wrapper: TestWrapper,
    });

    await act(async () => {
      await result.current.refetchRewardBalance();
    });

    expect(mockRefetchRewardBalance).toHaveBeenCalled();
  });
});
