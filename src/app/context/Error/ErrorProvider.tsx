import * as Sentry from "@sentry/nextjs";
import React, {
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useState,
} from "react";

import { ErrorModal } from "@/app/components/Modals/ErrorModal";
import {
  ErrorHandlerParam,
  ErrorType,
  ShowErrorParams,
} from "@/app/types/errors";

import { ClientError, ServerError } from "./errors";

const ErrorContext = createContext<ErrorContextType>({
  isErrorOpen: false,
  error: {
    message: "",
  },
  showError: () => {},
  hideError: () => {},
  handleError: () => {},
  captureError: () => {},
});

interface ErrorProviderProps {
  children: ReactNode;
}

interface ErrorContextType {
  isErrorOpen: boolean;
  error: ErrorType;
  retryErrorAction?: () => void;
  showError: (showErrorParams: ShowErrorParams) => void;
  hideError: () => void;
  noCancel?: boolean;
  handleError: ({
    error,
    hasError,
    errorState,
    refetchFunction,
  }: ErrorHandlerParam) => void;
  captureError: (error: Error | null) => void;
}

export const ErrorProvider: React.FC<ErrorProviderProps> = ({ children }) => {
  const [isErrorOpen, setIsErrorOpen] = useState(false);
  const [isNoCancel, setIsNoCancel] = useState(false);
  const [error, setError] = useState<ErrorType>({
    message: "",
    errorState: undefined,
  });
  const [retryErrorAction, setRetryErrorAction] = useState<
    (() => void) | undefined
  >();

  const showError = useCallback(
    ({ error, retryAction, noCancel }: ShowErrorParams) => {
      setError(error);
      setIsErrorOpen(true);
      setIsNoCancel(noCancel ?? false);
      setRetryErrorAction(() => retryAction);
    },
    [],
  );

  const hideError = useCallback(() => {
    setIsErrorOpen(false);
    setTimeout(() => {
      setError({
        message: "",
        errorState: undefined,
      });
      setRetryErrorAction(undefined);
      setIsNoCancel(false);
    }, 300);
  }, []);

  const handleError = useCallback(
    ({ error, hasError, errorState, refetchFunction }: ErrorHandlerParam) => {
      if (hasError && error) {
        if (error instanceof ClientError) {
          showError({
            error: {
              message: error.message,
              displayMessage: error.displayMessage,
              errorState: error.errorType,
            },
            retryAction: refetchFunction,
          });
        } else if (error instanceof ServerError) {
          showError({
            error: {
              message: error.message,
              endpoint: error.endpoint,
              errorState: error.errorType,
            },
            retryAction: refetchFunction,
          });
        } else {
          showError({
            error: {
              message: error.message,
              errorState: errorState,
            },
            retryAction: refetchFunction,
          });
        }

        captureError(error);
      }
    },
    [showError],
  );

  const captureError = useCallback((error: Error | null) => {
    if (error) {
      if (error instanceof ClientError || error instanceof ServerError) {
        Sentry.setExtra("errorType", error.errorType);
      }

      if (error instanceof ServerError) {
        Sentry.setExtra("endpoint", error.endpoint);
      }

      Sentry.captureException(error);
    }
  }, []);

  const value: ErrorContextType = {
    isErrorOpen: isErrorOpen,
    error,
    showError,
    hideError,
    retryErrorAction,
    noCancel: isNoCancel,
    handleError,
    captureError,
  };

  return (
    <ErrorContext.Provider value={value}>
      {children}
      <ErrorModal
        open={isErrorOpen}
        errorMessage={error.message}
        errorState={error.errorState}
        onClose={hideError}
        onRetry={retryErrorAction}
        noCancel={isNoCancel}
      />
    </ErrorContext.Provider>
  );
};

export const useError = () => {
  const context = useContext(ErrorContext);

  return context;
};
