import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { ReactNode } from "react";

import { StakingState, useStakingState } from "@/ui/baby/state/StakingState";

// Mock the dependencies
jest.mock("@/ui/baby/hooks/services/useDelegationService", () => ({
  useDelegationService: jest.fn(() => ({
    stake: jest.fn().mockResolvedValue({ txHash: "test-hash" }),
    estimateStakingFee: jest.fn().mockResolvedValue(1000),
  })),
}));

jest.mock("@/ui/baby/hooks/services/useValidatorService", () => ({
  useValidatorService: jest.fn(() => ({
    validatorMap: {
      validator123: {
        address: "validator123",
        name: "Test Validator",
      },
    },
    loading: false,
  })),
}));

jest.mock("@/ui/baby/hooks/services/useWalletService", () => ({
  useWalletService: jest.fn(() => ({
    balance: BigInt(10000000), // 10 BABY in ubbn
  })),
}));

jest.mock("@/ui/common/context/Error/ErrorProvider", () => ({
  useError: jest.fn(() => ({
    handleError: jest.fn(),
  })),
}));

jest.mock("@/ui/common/hooks/useLogger", () => ({
  useLogger: jest.fn(() => ({
    info: jest.fn(),
    error: jest.fn(),
  })),
}));

jest.mock("@/ui/common/hooks/client/api/usePrices", () => ({
  usePrice: jest.fn(() => 5.67), // $5.67 per BABY
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
    <QueryClientProvider client={queryClient}>
      <StakingState>{children}</StakingState>
    </QueryClientProvider>
  );
};

describe("StakingState (BABY)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should provide staking state methods and data", () => {
    const { result } = renderHook(() => useStakingState(), {
      wrapper: createWrapper(),
    });

    expect(result.current).toHaveProperty("step");
    expect(result.current).toHaveProperty("formSchema");
    expect(result.current).toHaveProperty("balance");
    expect(result.current).toHaveProperty("babyPrice");
    expect(result.current).toHaveProperty("showPreview");
    expect(result.current).toHaveProperty("closePreview");
    expect(result.current).toHaveProperty("submitForm");
    expect(result.current).toHaveProperty("calculateFee");
    expect(result.current).toHaveProperty("resetForm");
  });

  it("should start with initial step", () => {
    const { result } = renderHook(() => useStakingState(), {
      wrapper: createWrapper(),
    });

    expect(result.current.step.name).toBe("initial");
    expect(result.current.balance).toBe(10); // Converted from ubbn to BABY
    expect(result.current.babyPrice).toBe(5.67);
  });

  it("should transition to preview step", async () => {
    const { result } = renderHook(() => useStakingState(), {
      wrapper: createWrapper(),
    });

    const formData = {
      validatorAddress: "validator123",
      amount: 5,
      feeAmount: 1000,
    };

    await waitFor(() => {
      result.current.showPreview(formData);
    });

    expect(result.current.step.name).toBe("preview");
    expect(result.current.step.data?.amount).toBe(5);
    expect(result.current.step.data?.validator.name).toBe("Test Validator");
  });

  it("should calculate fees", async () => {
    const { result } = renderHook(() => useStakingState(), {
      wrapper: createWrapper(),
    });

    await waitFor(async () => {
      const fee = await result.current.calculateFee({
        validatorAddress: "validator123",
        amount: 5,
      });
      expect(fee).toBe(1000);
    });
  });

  it("should handle form submission", async () => {
    const { result } = renderHook(() => useStakingState(), {
      wrapper: createWrapper(),
    });

    // First show preview
    const formData = {
      validatorAddress: "validator123",
      amount: 5,
      feeAmount: 1000,
    };

    await waitFor(() => {
      result.current.showPreview(formData);
    });

    expect(result.current.step.name).toBe("preview");

    // Then submit
    await waitFor(async () => {
      await result.current.submitForm();
    });

    expect(result.current.step.name).toBe("success");
    expect(result.current.step.data?.txHash).toBe("test-hash");
  });

  it("should reset form to initial state", () => {
    const { result } = renderHook(() => useStakingState(), {
      wrapper: createWrapper(),
    });

    // Show preview first
    result.current.showPreview({
      validatorAddress: "validator123",
      amount: 5,
      feeAmount: 1000,
    });

    expect(result.current.step.name).toBe("preview");

    // Reset
    result.current.resetForm();

    expect(result.current.step.name).toBe("initial");
  });

  it("should validate form schema", () => {
    const { result } = renderHook(() => useStakingState(), {
      wrapper: createWrapper(),
    });

    expect(result.current.formSchema).toBeDefined();
    expect(result.current.fields).toContain("amount");
    expect(result.current.fields).toContain("validatorAddresses");
    expect(result.current.fields).toContain("feeAmount");
  });
});
