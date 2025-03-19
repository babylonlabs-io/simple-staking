import { fireEvent, render, screen } from "@testing-library/react";

import { Connect } from "@/app/components/Wallet/Connect";
import * as BTCWalletContext from "@/app/context/wallet/BTCWalletProvider";
import * as CosmosWalletContext from "@/app/context/wallet/CosmosWalletProvider";
import * as AppStateContext from "@/app/state";
import * as DelegationV2StateContext from "@/app/state/DelegationV2State";
import "@testing-library/jest-dom";

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
    return <img {...props} />;
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
      render(<Connect {...mockConnectedProps} />);

      // Open the wallet menu
      const menuButton = screen.getByRole("button", { name: /menu/i });
      fireEvent.click(menuButton);

      // Check that the Bitcoin public key is displayed
      const publicKeyText = await screen.findByText("Bitcoin Public Key");
      expect(publicKeyText).toBeInTheDocument();

      // The public key should be displayed
      expect(screen.getByText(mockPublicKey)).toBeInTheDocument();
    });

    it("should copy the Bitcoin public key when copy button is clicked", async () => {
      render(<Connect {...mockConnectedProps} />);

      // Open the wallet menu
      const menuButton = screen.getByRole("button", { name: /menu/i });
      fireEvent.click(menuButton);

      // Find the copy button (it's inside the container with the public key)
      const copyButton = screen.getByLabelText("Copy public key");
      fireEvent.click(copyButton);

      // Check that the clipboard API was called with the correct public key
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(mockPublicKey);

      // Since we can't directly test for the checkmark icon due to the implementation,
      // we'll test that the clipboard was called with the correct arguments
      expect(navigator.clipboard.writeText).toHaveBeenCalledTimes(1);
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(mockPublicKey);
    });
  });
});
