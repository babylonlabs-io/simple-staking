import { useError } from "@/ui/common/context/Error/ErrorProvider";
import { WalletConnectionProvider } from "@/ui/common/context/wallet/WalletConnectionProvider";
import { useLogger } from "@/ui/common/hooks/useLogger";
import FeatureFlagService from "@/ui/common/utils/FeatureFlagService";
import { WalletProvider } from "@babylonlabs-io/wallet-connector";
import { render } from "@testing-library/react";
import { useTheme } from "next-themes";

// Mock the dependencies
jest.mock("@babylonlabs-io/wallet-connector", () => ({
  WalletProvider: jest.fn(({ children }) => (
    <div data-testid="wallet-provider">{children}</div>
  )),
  ExternalWallets: jest.fn(() => <div data-testid="external-wallets" />),
}));

jest.mock("next-themes", () => ({
  useTheme: jest.fn(),
}));

jest.mock("@/ui/legacy/context/Error/ErrorProvider", () => ({
  useError: jest.fn(),
}));

jest.mock("@/ui/legacy/hooks/useLogger", () => ({
  useLogger: jest.fn(),
}));

jest.mock("@/ui/legacy/utils/FeatureFlagService", () => ({
  __esModule: true,
  default: {
    IsLedgerEnabled: false,
  },
}));

describe("WalletConnectionProvider", () => {
  const mockHandleError = jest.fn();
  const mockLogger = {
    error: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useTheme as jest.Mock).mockReturnValue({ theme: "light" });
    (useError as jest.Mock).mockReturnValue({ handleError: mockHandleError });
    (useLogger as jest.Mock).mockReturnValue(mockLogger);
  });

  it("should disable ledger wallet when feature flag is not defined", () => {
    render(
      <WalletConnectionProvider>
        <div>Test Child</div>
      </WalletConnectionProvider>,
    );

    expect(WalletProvider).toHaveBeenCalledWith(
      expect.objectContaining({
        disabledWallets: ["ledget_btc"],
      }),
      expect.anything(),
    );
  });

  it("should disable ledger wallet when feature flag is disabled", () => {
    // Mock feature flag as disabled
    (FeatureFlagService.IsLedgerEnabled as boolean) = false;

    render(
      <WalletConnectionProvider>
        <div>Test Child</div>
      </WalletConnectionProvider>,
    );

    expect(WalletProvider).toHaveBeenCalledWith(
      expect.objectContaining({
        disabledWallets: ["ledget_btc"],
      }),
      expect.anything(),
    );
  });

  it("should enable ledger wallet when feature flag is enabled", () => {
    // Mock feature flag as enabled
    (FeatureFlagService.IsLedgerEnabled as boolean) = true;

    render(
      <WalletConnectionProvider>
        <div>Test Child</div>
      </WalletConnectionProvider>,
    );

    expect(WalletProvider).toHaveBeenCalledWith(
      expect.objectContaining({
        disabledWallets: [],
      }),
      expect.anything(),
    );
  });

  it("should pass correct props to WalletProvider", () => {
    render(
      <WalletConnectionProvider>
        <div>Test Child</div>
      </WalletConnectionProvider>,
    );

    expect(WalletProvider).toHaveBeenCalledWith(
      expect.objectContaining({
        persistent: true,
        theme: "light",
        context: expect.any(Object),
        lifecycleHooks: expect.any(Object),
        config: expect.any(Array),
        onError: expect.any(Function),
      }),
      expect.anything(),
    );
  });

  it("should handle wallet connection errors", () => {
    const error = new Error("Connection failed");
    render(
      <WalletConnectionProvider>
        <div>Test Child</div>
      </WalletConnectionProvider>,
    );

    // Get the onError function that was passed to WalletProvider
    const onError = (WalletProvider as jest.Mock).mock.calls[0][0].onError;

    // Call onError with a non-rejection error
    onError(error);

    expect(mockLogger.error).toHaveBeenCalled();
    expect(mockHandleError).toHaveBeenCalledWith({
      error: expect.any(Error),
    });
  });

  it("should not handle wallet rejection errors", () => {
    const rejectionError = new Error("User rejected the request");
    render(
      <WalletConnectionProvider>
        <div>Test Child</div>
      </WalletConnectionProvider>,
    );

    // Get the onError function that was passed to WalletProvider
    const onError = (WalletProvider as jest.Mock).mock.calls[0][0].onError;

    // Call onError with a rejection error
    onError(rejectionError);

    expect(mockLogger.error).not.toHaveBeenCalled();
    expect(mockHandleError).not.toHaveBeenCalled();
  });
});
