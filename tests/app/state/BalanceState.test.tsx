import { renderHook } from "@testing-library/react";
import { PropsWithChildren } from "react";

// Mock the dependencies, but keep their APIs close to real ones
const mockUseBbnQuery = jest.fn();
jest.mock("@/ui/common/hooks/client/rpc/queries/useBbnQuery", () => ({
  useBbnQuery: () => mockUseBbnQuery(),
}));

const mockUseAppState = jest.fn();
jest.mock("@/ui/common/state", () => ({
  useAppState: () => mockUseAppState(),
}));

const mockUseDelegationV2State = jest.fn();
jest.mock("@/ui/common/state/DelegationV2State", () => ({
  useDelegationV2State: () => mockUseDelegationV2State(),
}));

// Import the actual component we're testing (after mocks are defined)
import { BalanceState, useBalanceState } from "@/ui/common/state/BalanceState";
import { DelegationV2StakingState } from "@/ui/common/types/delegationsV2";

// Create a test wrapper that provides the Balance state
const TestWrapper = ({ children }: PropsWithChildren) => (
  <BalanceState>{children}</BalanceState>
);

describe("BalanceState", () => {
  const mockReconnectRpc = jest.fn();

  // Setup common test data
  const mockAvailableUTXOs = [
    { txid: "tx1", vout: 0, value: 100000 },
    { txid: "tx2", vout: 1, value: 200000 },
  ];

  const mockAllUTXOs = [
    ...mockAvailableUTXOs,
    { txid: "tx3", vout: 0, value: 300000 },
  ];

  const mockInscriptionsUTXOs = [{ txid: "tx3", vout: 0, value: 300000 }];

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock default dependency results
    mockUseAppState.mockReturnValue({
      availableUTXOs: mockAvailableUTXOs,
      allUTXOs: mockAllUTXOs,
      inscriptionsUTXOs: mockInscriptionsUTXOs,
      isLoading: false,
    });

    mockUseBbnQuery.mockReturnValue({
      balanceQuery: {
        data: 1000000,
        isLoading: false,
      },
      hasRpcError: false,
      reconnectRpc: mockReconnectRpc,
    });

    mockUseDelegationV2State.mockReturnValue({
      delegations: [
        {
          stakingAmount: 400000,
          state: DelegationV2StakingState.ACTIVE,
          stakingTxHashHex: "hash1",
        },
        {
          stakingAmount: 500000,
          state: DelegationV2StakingState.TIMELOCK_UNBONDING,
          stakingTxHashHex: "hash2",
        },
        {
          stakingAmount: 600000,
          state: DelegationV2StakingState.PENDING,
          stakingTxHashHex: "hash3",
        },
      ],
    });
  });

  it("should calculate stakableBtcBalance correctly as sum of availableUTXOs", () => {
    const { result } = renderHook(() => useBalanceState(), {
      wrapper: TestWrapper,
    });
    // The actual calculation should sum the availableUTXOs values (100000 + 200000)
    expect(result.current.stakableBtcBalance).toBe(300000);
  });

  it("should calculate totalBtcBalance correctly as sum of allUTXOs", () => {
    const { result } = renderHook(() => useBalanceState(), {
      wrapper: TestWrapper,
    });
    // The actual calculation should sum the allUTXOs values (100000 + 200000 + 300000)
    expect(result.current.totalBtcBalance).toBe(600000);
  });

  it("should calculate inscriptionsBtcBalance correctly as sum of inscriptionsUTXOs", () => {
    const { result } = renderHook(() => useBalanceState(), {
      wrapper: TestWrapper,
    });
    // The actual calculation should sum the inscriptionsUTXOs values (300000)
    expect(result.current.inscriptionsBtcBalance).toBe(300000);
  });

  it("should calculate stakedBtcBalance correctly based on delegations with appropriate states", () => {
    const { result } = renderHook(() => useBalanceState(), {
      wrapper: TestWrapper,
    });
    // Only ACTIVE and TIMELOCK_UNBONDING states should be included (400000 + 500000)
    expect(result.current.stakedBtcBalance).toBe(900000);
  });

  it("should get bbnBalance from the query result", () => {
    const { result } = renderHook(() => useBalanceState(), {
      wrapper: TestWrapper,
    });
    expect(result.current.bbnBalance).toBe(1000000);
  });

  it("should set loading state correctly when BTC balance is loading", () => {
    mockUseAppState.mockReturnValue({
      ...mockUseAppState(),
      isLoading: true,
    });

    const { result } = renderHook(() => useBalanceState(), {
      wrapper: TestWrapper,
    });
    expect(result.current.loading).toBe(true);
  });

  it("should set loading state correctly when Cosmos balance is loading", () => {
    mockUseBbnQuery.mockReturnValue({
      ...mockUseBbnQuery(),
      balanceQuery: {
        ...mockUseBbnQuery().balanceQuery,
        isLoading: true,
      },
    });

    const { result } = renderHook(() => useBalanceState(), {
      wrapper: TestWrapper,
    });
    expect(result.current.loading).toBe(true);
  });

  it("should handle RPC error state correctly", () => {
    mockUseBbnQuery.mockReturnValue({
      ...mockUseBbnQuery(),
      hasRpcError: true,
    });

    const { result } = renderHook(() => useBalanceState(), {
      wrapper: TestWrapper,
    });
    expect(result.current.hasRpcError).toBe(true);
  });

  it("should provide reconnectRpc method correctly", () => {
    const { result } = renderHook(() => useBalanceState(), {
      wrapper: TestWrapper,
    });

    result.current.reconnectRpc();
    expect(mockReconnectRpc).toHaveBeenCalled();
  });

  it("should handle case when availableUTXOs is undefined", () => {
    mockUseAppState.mockReturnValue({
      ...mockUseAppState(),
      availableUTXOs: undefined,
    });

    const { result } = renderHook(() => useBalanceState(), {
      wrapper: TestWrapper,
    });
    expect(result.current.stakableBtcBalance).toBe(0);
  });

  it("should handle case when allUTXOs is undefined", () => {
    mockUseAppState.mockReturnValue({
      ...mockUseAppState(),
      allUTXOs: undefined,
    });

    const { result } = renderHook(() => useBalanceState(), {
      wrapper: TestWrapper,
    });
    expect(result.current.totalBtcBalance).toBe(0);
  });

  it("should handle case when inscriptionsUTXOs is undefined", () => {
    mockUseAppState.mockReturnValue({
      ...mockUseAppState(),
      inscriptionsUTXOs: undefined,
    });

    const { result } = renderHook(() => useBalanceState(), {
      wrapper: TestWrapper,
    });
    expect(result.current.inscriptionsBtcBalance).toBe(0);
  });

  it("should include all appropriate delegation states in stakedBtcBalance calculation", () => {
    // Create mock delegations with all different states to test the filtering
    mockUseDelegationV2State.mockReturnValue({
      delegations: [
        {
          stakingAmount: 100000,
          state: DelegationV2StakingState.ACTIVE,
          stakingTxHashHex: "hash1",
        },
        {
          stakingAmount: 200000,
          state: DelegationV2StakingState.TIMELOCK_UNBONDING,
          stakingTxHashHex: "hash2",
        },
        {
          stakingAmount: 300000,
          state: DelegationV2StakingState.EARLY_UNBONDING,
          stakingTxHashHex: "hash3",
        },
        {
          stakingAmount: 400000,
          state: DelegationV2StakingState.TIMELOCK_WITHDRAWABLE,
          stakingTxHashHex: "hash4",
        },
        {
          stakingAmount: 500000,
          state: DelegationV2StakingState.EARLY_UNBONDING_WITHDRAWABLE,
          stakingTxHashHex: "hash5",
        },
        {
          stakingAmount: 600000,
          state: DelegationV2StakingState.PENDING,
          stakingTxHashHex: "hash6",
        }, // Should not be included
        {
          stakingAmount: 700000,
          state: DelegationV2StakingState.INTERMEDIATE_UNBONDING_SUBMITTED,
          stakingTxHashHex: "hash7",
        },
      ],
    });

    const { result } = renderHook(() => useBalanceState(), {
      wrapper: TestWrapper,
    });
    // Only states in STAKED_BALANCE_STATUSES should be included, which should be all except PENDING
    // 100000 + 200000 + 300000 + 400000 + 500000 + 700000 = 2200000
    expect(result.current.stakedBtcBalance).toBe(2200000);
  });

  it("should handle empty delegations array", () => {
    mockUseDelegationV2State.mockReturnValue({
      delegations: [],
    });

    const { result } = renderHook(() => useBalanceState(), {
      wrapper: TestWrapper,
    });
    expect(result.current.stakedBtcBalance).toBe(0);
  });

  it("should handle undefined bbnBalance", () => {
    mockUseBbnQuery.mockReturnValue({
      ...mockUseBbnQuery(),
      balanceQuery: {
        ...mockUseBbnQuery().balanceQuery,
        data: undefined,
      },
    });

    const { result } = renderHook(() => useBalanceState(), {
      wrapper: TestWrapper,
    });
    expect(result.current.bbnBalance).toBe(0);
  });
});
