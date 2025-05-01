/* eslint-disable import/order */
import { ClientErrorCategory } from "@/app/constants/errorMessages";
import { ErrorProvider, useError } from "@/app/context/Error/ErrorProvider";
import { ClientError } from "@/app/context/Error/errors/clientError";
import { ErrorType } from "@/app/types/errors";
import "@testing-library/jest-dom";

import { render, screen, waitFor } from "@testing-library/react";
import React, { useRef } from "react";

jest.mock("@/app/components/Modals/ErrorModal", () => ({
  ErrorModal: () => <div data-testid="error-modal">Error Modal</div>,
}));

jest.mock("@sentry/nextjs", () => {
  const mockSentryWithScope = jest.fn();
  const mockSentryCaptureException = jest.fn();
  const mockAddBreadcrumb = jest.fn();

  return {
    withScope: mockSentryWithScope.mockImplementation((fn) => {
      const mockScope = {
        setExtras: jest.fn(),
        setTag: jest.fn(),
      };
      fn(mockScope);
      return "mock-sentry-event-id";
    }),
    captureException: mockSentryCaptureException.mockImplementation(
      () => "mock-sentry-event-id",
    ),
    addBreadcrumb: mockAddBreadcrumb,
  };
});

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

  const mockedSentry = jest.requireMock("@sentry/nextjs");

  beforeEach(() => {
    mockedSentry.withScope.mockClear();
    mockedSentry.captureException.mockClear();
    mockedSentry.addBreadcrumb.mockClear();
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

    expect(mockedSentry.withScope).toHaveBeenCalled();
    expect(mockedSentry.captureException).toHaveBeenCalledWith(testError);

    const scopeFunction = mockedSentry.withScope.mock.calls[0][0];
    const mockScope = {
      setExtras: jest.fn(),
      setTag: jest.fn(),
    };
    scopeFunction(mockScope);
    const metadataPassedToSentry = mockScope.setExtras.mock.calls[0][0];

    expect(metadataPassedToSentry).toMatchObject({
      trace: expect.any(String),
    });

    expect(mockedSentry.addBreadcrumb).toHaveBeenCalledWith({
      category: "metadata",
      message: "Application metadata captured",
      level: "info",
      data: {
        errorSource: undefined,
        userPublicKey: mockWalletData.userPublicKey,
        btcAddress: mockWalletData.btcAddress,
        babylonAddress: mockWalletData.babylonAddress,
        testField: "Additional test data",
      },
    });

    expect(mockScope.setTag).toHaveBeenCalledWith(
      "errorType",
      ErrorType.STAKING,
    );
    expect(mockScope.setTag).toHaveBeenCalledWith(
      "errorCategory",
      ClientErrorCategory.CLIENT_TRANSACTION,
    );
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

    expect(mockedSentry.withScope).toHaveBeenCalled();
    expect(mockedSentry.captureException).toHaveBeenCalledWith(testError);

    const scopeFunction = mockedSentry.withScope.mock.calls[0][0];
    const mockScope = {
      setExtras: jest.fn(),
      setTag: jest.fn(),
    };
    scopeFunction(mockScope);
    const metadataPassedToSentry = mockScope.setExtras.mock.calls[0][0];

    expect(metadataPassedToSentry).toMatchObject({
      trace: expect.any(String),
    });

    expect(metadataPassedToSentry).not.toHaveProperty("errorSource");

    expect(mockedSentry.addBreadcrumb).toHaveBeenCalledWith({
      category: "metadata",
      message: "Application metadata captured",
      level: "info",
      data: {
        errorSource: undefined,
      },
    });

    expect(mockScope.setTag).toHaveBeenCalledWith(
      "errorType",
      ErrorType.UNKNOWN,
    );
    expect(mockScope.setTag).toHaveBeenCalledWith(
      "errorCategory",
      ClientErrorCategory.CLIENT_UNKNOWN,
    );
  });
});
