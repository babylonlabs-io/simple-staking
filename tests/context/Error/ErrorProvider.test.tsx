/* eslint-disable import/order */
import { ClientErrorCategory } from "@/ui/constants/errorMessages";
import { ErrorProvider, useError } from "@/ui/context/Error/ErrorProvider";
import { ClientError } from "@/ui/context/Error/errors/clientError";
import { ErrorType } from "@/ui/types/errors";
import "@testing-library/jest-dom";

import { render, screen, waitFor } from "@testing-library/react";
import React, { useRef } from "react";

jest.mock("@/ui/components/Modals/ErrorModal", () => ({
  ErrorModal: () => <div data-testid="error-modal">Error Modal</div>,
}));

const TestErrorComponent = ({
  error,
  walletMetadata = {},
}: {
  error: Error;
  walletMetadata?: Record<string, string>;
}) => {
  const { handleError } = useError();
  const errorTriggeredRef = useRef(false);

  React.useEffect(() => {
    if (!errorTriggeredRef.current) {
      errorTriggeredRef.current = true;
      handleError({
        error,
        displayOptions: {
          showModal: true,
          retryAction: () => console.log("Retry action triggered"),
        },
        metadata: walletMetadata,
      });
    }
  }, [error, handleError, walletMetadata]);

  return <div>Test Component</div>;
};

describe("ErrorProvider", () => {
  const mockWalletData = {
    userPublicKey:
      "0247e32324da2ea5224dba5a2c8e13bc97071b5f4f5ec3ffaf4e0e43e8e9187514",
    btcAddress: "bc1qxz8tnmcwxp7fzehh8rnr0utxnku9sr0hhwgzqd",
    babylonAddress: "bbn1s0qvpzs3mxc7pm4aqn9mu9xhvmsr34m49r5qnp",
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("captures error with wallet metadata", async () => {
    const testError = new ClientError({
      message: "Test error message",
      category: ClientErrorCategory.CLIENT_TRANSACTION,
      type: ErrorType.STAKING,
    });

    const walletMetadata = {
      ...mockWalletData,
      testField: "Additional test data",
    };

    render(
      <ErrorProvider>
        <TestErrorComponent error={testError} walletMetadata={walletMetadata} />
      </ErrorProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("error-modal")).toBeInTheDocument();
    });
  });

  it("handles error without wallet metadata", async () => {
    const testError = new ClientError({
      message: "Basic error without wallet data",
      category: ClientErrorCategory.CLIENT_UNKNOWN,
      type: ErrorType.UNKNOWN,
    });

    render(
      <ErrorProvider>
        <TestErrorComponent error={testError} />
      </ErrorProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("error-modal")).toBeInTheDocument();
    });
  });
});
