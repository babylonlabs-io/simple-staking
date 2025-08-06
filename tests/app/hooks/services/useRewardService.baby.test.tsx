import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { ReactNode } from "react";

import { useRewardService } from "@/ui/baby/hooks/services/useRewardService";

// Mock the dependencies
jest.mock("@/infrastructure/babylon", () => ({
  default: {
    txs: {
      baby: {
        createClaimRewardMsg: jest.fn(() => ({ mockClaimMsg: true })),
      },
    },
  },
}));

jest.mock("@/ui/baby/hooks/api/useRewards", () => ({
  useRewards: jest.fn(() => ({
    data: [
      {
        validatorAddress: "validator1",
        reward: [{ denom: "ubbn", amount: "1000000" }],
      },
      {
        validatorAddress: "validator2",
        reward: [{ denom: "ubbn", amount: "2000000" }],
      },
    ],
    isLoading: false,
    refetch: jest.fn(),
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
    sendBbnTx: jest.fn().mockResolvedValue({ txHash: "reward-hash" }),
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

describe("useRewardService (BABY)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should provide reward service methods", () => {
    const { result } = renderHook(() => useRewardService(), {
      wrapper: createWrapper(),
    });

    expect(result.current).toHaveProperty("rewards");
    expect(result.current).toHaveProperty("totalReward");
    expect(result.current).toHaveProperty("claimAllRewards");
    expect(result.current).toHaveProperty("claimReward");
    expect(result.current).toHaveProperty("loading");
  });

  it("should calculate total rewards correctly", () => {
    const { result } = renderHook(() => useRewardService(), {
      wrapper: createWrapper(),
    });

    expect(result.current.rewards).toHaveLength(2);
    expect(result.current.totalReward).toBe(3000000n);
  });

  it("should handle claim all rewards", async () => {
    const { result } = renderHook(() => useRewardService(), {
      wrapper: createWrapper(),
    });

    await waitFor(async () => {
      const claimResult = await result.current.claimAllRewards();
      expect(claimResult).toEqual({ txHash: "reward-hash" });
    });
  });

  it("should handle single validator claim", async () => {
    const { result } = renderHook(() => useRewardService(), {
      wrapper: createWrapper(),
    });

    await waitFor(async () => {
      const claimResult = await result.current.claimReward("validator1");
      expect(claimResult).toEqual({ txHash: "reward-hash" });
    });
  });

  it("should filter rewards by ubbn denom", () => {
    const { useRewards } = require("@/ui/baby/hooks/api/useRewards");
    useRewards.mockReturnValue({
      data: [
        {
          validatorAddress: "validator1",
          reward: [
            { denom: "ubbn", amount: "1000000" },
            { denom: "other", amount: "500000" },
          ],
        },
        {
          validatorAddress: "validator2",
          reward: [{ denom: "other", amount: "2000000" }],
        },
      ],
      isLoading: false,
      refetch: jest.fn(),
    });

    const { result } = renderHook(() => useRewardService(), {
      wrapper: createWrapper(),
    });

    // Only validator1 should be included (has ubbn rewards)
    expect(result.current.rewards).toHaveLength(1);
    expect(result.current.rewards[0].validatorAddress).toBe("validator1");
    expect(result.current.rewards[0].amount).toBe(1000000n);
  });

  it("should throw error when wallet not connected", async () => {
    const {
      useCosmosWallet,
    } = require("@/ui/common/context/wallet/CosmosWalletProvider");
    useCosmosWallet.mockReturnValue({ bech32Address: null });

    const { result } = renderHook(() => useRewardService(), {
      wrapper: createWrapper(),
    });

    await expect(result.current.claimAllRewards()).rejects.toThrow(
      "Babylon Wallet is not connected",
    );

    await expect(result.current.claimReward("validator1")).rejects.toThrow(
      "Babylon Wallet is not connected",
    );
  });
});
