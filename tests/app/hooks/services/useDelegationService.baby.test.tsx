import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { ReactNode } from "react";

import { useDelegationService } from "@/ui/baby/hooks/services/useDelegationService";

// Mock the dependencies
jest.mock("@/infrastructure/babylon", () => ({
  default: {
    txs: {
      baby: {
        createStakeMsg: jest.fn(() => ({ mockStakeMsg: true })),
        createUnstakeMsg: jest.fn(() => ({ mockUnstakeMsg: true })),
      },
    },
    utils: {
      babyToUbbn: jest.fn((value: number) => BigInt(value * 1000000)),
    },
  },
}));

jest.mock("@/ui/baby/hooks/api/useDelegations", () => ({
  useDelegations: jest.fn(() => ({
    data: [],
    refetch: jest.fn(),
    isLoading: false,
  })),
}));

jest.mock("@/ui/baby/hooks/services/useValidatorService", () => ({
  useValidatorService: jest.fn(() => ({
    validatorMap: {},
    loading: false,
  })),
}));

jest.mock("@/ui/common/context/wallet/CosmosWalletProvider", () => ({
  useCosmosWallet: jest.fn(() => ({
    bech32Address: "test-address",
  })),
}));

jest.mock("@/ui/common/hooks/client/rpc/mutation/useBbnTransaction", () => ({
  useBbnTransaction: jest.fn(() => ({
    signBbnTx: jest.fn().mockResolvedValue({ signedTx: true }),
    sendBbnTx: jest.fn().mockResolvedValue({ txHash: "test-hash" }),
    estimateBbnGasFee: jest.fn().mockResolvedValue({
      amount: [{ amount: "1000" }],
    }),
  })),
}));

// Mock EventBus
jest.mock("@/ui/common/hooks/useEventBus", () => ({
  useEventEmitter: jest.fn(() => ({
    emit: jest.fn(),
  })),
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe("useDelegationService (BABY)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should provide delegation service methods", () => {
    const { result } = renderHook(() => useDelegationService(), {
      wrapper: createWrapper(),
    });

    expect(result.current).toHaveProperty("stake");
    expect(result.current).toHaveProperty("unstake");
    expect(result.current).toHaveProperty("estimateStakingFee");
    expect(result.current).toHaveProperty("delegations");
    expect(result.current).toHaveProperty("loading");
  });

  it("should handle stake transaction", async () => {
    const { result } = renderHook(() => useDelegationService(), {
      wrapper: createWrapper(),
    });

    const stakeParams = {
      validatorAddress: "validator123",
      amount: 100,
    };

    await waitFor(async () => {
      const stakeResult = await result.current.stake(stakeParams);
      expect(stakeResult).toEqual({ txHash: "test-hash" });
    });
  });

  it("should handle unstake transaction", async () => {
    const { result } = renderHook(() => useDelegationService(), {
      wrapper: createWrapper(),
    });

    const unstakeParams = {
      validatorAddress: "validator123",
      amount: "50",
    };

    await waitFor(async () => {
      const unstakeResult = await result.current.unstake(unstakeParams);
      expect(unstakeResult).toEqual({ txHash: "test-hash" });
    });
  });

  it("should estimate staking fee", async () => {
    const { result } = renderHook(() => useDelegationService(), {
      wrapper: createWrapper(),
    });

    const feeParams = {
      validatorAddress: "validator123",
      amount: 100,
    };

    await waitFor(async () => {
      const fee = await result.current.estimateStakingFee(feeParams);
      expect(fee).toBe(1000);
    });
  });

  it("should throw error when wallet not connected", async () => {
    const {
      useCosmosWallet,
    } = require("@/ui/common/context/wallet/CosmosWalletProvider");
    useCosmosWallet.mockReturnValue({ bech32Address: null });

    const { result } = renderHook(() => useDelegationService(), {
      wrapper: createWrapper(),
    });

    await expect(
      result.current.stake({ validatorAddress: "test", amount: 100 }),
    ).rejects.toThrow("Babylon Wallet is not connected");
  });
});
