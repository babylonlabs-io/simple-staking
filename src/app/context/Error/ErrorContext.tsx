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

const ErrorContext = createContext<ErrorContextType | undefined>(undefined);

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
        showError({
          error: {
            message: error.message,
            errorState: errorState,
          },
          retryAction: refetchFunction,
        });
      }
    },
    [showError],
  );

  const value: ErrorContextType = {
    isErrorOpen: isErrorOpen,
    error,
    showError,
    hideError,
    retryErrorAction,
    noCancel: isNoCancel,
    handleError,
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
  if (context === undefined) {
    throw new Error("useError must be used within an ErrorProvider");
  }
  return context;
};
