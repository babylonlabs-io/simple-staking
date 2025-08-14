import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode } from "react";

import { useClientQuery } from "@/ui/common/hooks/client/useClient";

import { testHookStability } from "../../../helper/validationHelper";

jest.mock("@/ui/common/context/Error/ErrorProvider", () => ({
  useError: () => ({
    isOpen: false,
    handleError: jest.fn(),
  }),
}));

jest.mock("@/ui/common/hooks/useLogger", () => ({
  useLogger: () => ({
    error: jest.fn(),
  }),
}));

const TestWrapper = ({ children }: { children: ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        refetchOnWindowFocus: false,
      },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe("useClientQuery", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should fetch data with default options and return expected properties", () => {
    const mockQueryFn = jest.fn().mockResolvedValue("test data");
    const stableOptions = {
      queryKey: ["test", "stable"],
      queryFn: mockQueryFn,
    };

    const { renderCount, result } = testHookStability(
      () => useClientQuery(stableOptions),
      { wrapper: TestWrapper },
    );

    expect(renderCount).toBeLessThan(5);

    expect(result).toHaveProperty("data");
    expect(result).toHaveProperty("isLoading");
    expect(result).toHaveProperty("isError");
    expect(result).toHaveProperty("refetch");
  });
});
