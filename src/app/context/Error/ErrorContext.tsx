import React, {
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useState,
} from "react";

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
    errorTime: new Date(),
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
        errorTime: new Date(),
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
            errorTime: new Date(),
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
    <ErrorContext.Provider value={value}>{children}</ErrorContext.Provider>
  );
};

export const useError = () => {
  const context = useContext(ErrorContext);
  if (context === undefined) {
    throw new Error("useError must be used within an ErrorProvider");
  }
  return context;
};
