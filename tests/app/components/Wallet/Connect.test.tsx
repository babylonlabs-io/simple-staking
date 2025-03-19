import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import React from "react";

import { Connect } from "@/app/components/Wallet/Connect";
import * as BTCWalletContext from "@/app/context/wallet/BTCWalletProvider";
import * as CosmosWalletContext from "@/app/context/wallet/CosmosWalletProvider";
import * as AppStateContext from "@/app/state";
import * as DelegationV2StateContext from "@/app/state/DelegationV2State";
import "@testing-library/jest-dom";

// Mock the SVG and image imports
jest.mock("@/app/assets/bbn.svg", () => "bbn-icon-mock");
jest.mock("@/app/assets/bitcoin.png", () => "bitcoin-icon-mock");
jest.mock("@/app/assets/warning-triangle.svg", () => "warning-triangle-mock");
jest.mock(
  "@/app/components/Staking/Form/States/connect-icon.svg",
  () => "connect-icon-mock",
);

// Mock window.matchMedia - required for useMediaQuery hook
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // Deprecated
    removeListener: jest.fn(), // Deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock clipboard API
Object.assign(navigator, {
  clipboard: {
    writeText: jest.fn(),
  },
});

// Mock the context providers
jest.mock("@/app/context/wallet/BTCWalletProvider", () => ({
  useBTCWallet: jest.fn(),
}));

jest.mock("@/app/context/wallet/CosmosWalletProvider", () => ({
  useCosmosWallet: jest.fn(),
}));

jest.mock("@/app/state", () => ({
  useAppState: jest.fn(),
}));

jest.mock("@/app/state/DelegationV2State", () => ({
  useDelegationV2State: jest.fn(),
}));

// Mock Next.js Image component
jest.mock("next/image", () => ({
  __esModule: true,
  default: (props: any) => {
    return <img src={props.src} alt={props.alt} />;
  },
}));

// Mock widget state
jest.mock("@babylonlabs-io/wallet-connector", () => ({
  useWalletConnect: jest.fn(() => ({
    disconnect: jest.fn(),
  })),
  useWidgetState: jest.fn(() => ({
    selectedWallets: [],
  })),
  useInscriptionProvider: jest.fn(),
}));

// Mock react-tooltip
jest.mock("react-tooltip", () => ({
  Tooltip: () => <div data-testid="tooltip" />,
}));

// Mock health check hook
jest.mock("@/app/hooks/useHealthCheck", () => ({
  useHealthCheck: jest.fn(() => ({
    isApiNormal: true,
    isGeoBlocked: false,
    apiMessage: "",
  })),
}));

// Mock breakpoint hooks
jest.mock("@/app/hooks/useBreakpoint", () => ({
  useBreakpoint: jest.fn().mockReturnValue(false),
  useIsMobileView: jest.fn().mockReturnValue(false),
}));

// Mock Popover from core-ui to prevent act warnings
jest.mock("@babylonlabs-io/core-ui", () => {
  const originalModule = jest.requireActual("@babylonlabs-io/core-ui");
  return {
    ...originalModule,
    Popover: ({
      children,
      open,
    }: {
      children: React.ReactNode;
      open: boolean;
    }) => (open ? <div>{children}</div> : null),
  };
});

describe("Connect Component", () => {
  const mockPublicKey =
    "e93d17947ec10fc375f95d0e6adf65d2764435a7cfb8a88d91a0fbc51b5f0b58";
  const mockAddress = "bc1q7q29ya2e5w5kvm3z82l7ytqwlxsrr0mtxm7g58";
  const mockBech32Address = "bbn123456789abcdef";

  const mockConnectedProps = {
    onConnect: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock BTCWallet context
    jest.spyOn(BTCWalletContext, "useBTCWallet").mockReturnValue({
      loading: false,
      address: mockAddress,
      connected: true,
      publicKeyNoCoord: mockPublicKey,
      disconnect: jest.fn(),
      getAddress: jest.fn(),
      getPublicKeyHex: jest.fn(),
      signPsbt: jest.fn(),
      signPsbts: jest.fn(),
      getNetwork: jest.fn(),
      signMessage: jest.fn(),
      getBalance: jest.fn(),
      getNetworkFees: jest.fn(),
      pushTx: jest.fn(),
      getBTCTipHeight: jest.fn(),
      getInscriptions: jest.fn(),
      open: jest.fn(),
      network: undefined,
    });

    // Mock CosmosWallet context
    jest.spyOn(CosmosWalletContext, "useCosmosWallet").mockReturnValue({
      loading: false,
      bech32Address: mockBech32Address,
      connected: true,
      disconnect: jest.fn(),
      open: jest.fn(),
      signingStargateClient: undefined,
    });

    // Mock AppState context
    jest.spyOn(AppStateContext, "useAppState").mockReturnValue({
      ordinalsExcluded: true,
      includeOrdinals: jest.fn(),
      excludeOrdinals: jest.fn(),
      isError: false,
      isLoading: false,
      refetchUTXOs: jest.fn(),
      setTheme: jest.fn(),
    });

    // Mock DelegationV2State context with all required properties
    jest
      .spyOn(DelegationV2StateContext, "useDelegationV2State")
      .mockReturnValue({
        isLoading: false,
        linkedDelegationsVisibility: false,
        hasMoreDelegations: false,
        delegations: [],
        addDelegation: jest.fn(),
        updateDelegationStatus: jest.fn(),
        fetchMoreDelegations: jest.fn(),
        findDelegationByTxHash: jest.fn(),
        refetch: jest.fn(),
        displayLinkedDelegations: jest.fn(),
      });
  });

  describe("Bitcoin Public Key Button", () => {
    it("should display the Bitcoin public key", async () => {
      await act(async () => {
        render(<Connect {...mockConnectedProps} />);
      });

      // Find and click the menu button
      const menuButtons = screen.getAllByRole("button");
      const menuButton = menuButtons.find((button) =>
        button.className.includes("border rounded border-secondary-contrast"),
      );

      expect(menuButton).toBeDefined();

      await act(async () => {
        fireEvent.click(menuButton!);
      });

      // Check that the Bitcoin public key is displayed
      await waitFor(() => {
        const publicKeyText = screen.getByText("Bitcoin Public Key");
        expect(publicKeyText).toBeInTheDocument();

        // The public key should be displayed
        expect(screen.getByText(mockPublicKey)).toBeInTheDocument();
      });
    });

    it("should copy the Bitcoin public key when copy button is clicked", async () => {
      await act(async () => {
        render(<Connect {...mockConnectedProps} />);
      });

      // Find and click the menu button
      const menuButtons = screen.getAllByRole("button");
      const menuButton = menuButtons.find((button) =>
        button.className.includes("border rounded border-secondary-contrast"),
      );

      expect(menuButton).toBeDefined();

      await act(async () => {
        fireEvent.click(menuButton!);
      });

      await waitFor(async () => {
        // Find the copy button (it's next to the public key)
        const copyButton = screen.getByRole("button", {
          name: "Copy public key",
        });

        await act(async () => {
          fireEvent.click(copyButton);
        });
      });

      // Check that the clipboard API was called with the correct public key
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(mockPublicKey);
      expect(navigator.clipboard.writeText).toHaveBeenCalledTimes(1);
    });
  });
});
