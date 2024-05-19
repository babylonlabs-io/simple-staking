import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from "react";

import { ErrorType } from "@/app/types/errorState";

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
}

interface ShowErrorParams {
  error: ErrorType;
  retryAction?: () => void;
}

export const ErrorProvider: React.FC<ErrorProviderProps> = ({ children }) => {
  const [isErrorOpen, setIsErrorOpen] = useState(false);
  const [error, setError] = useState<ErrorType>({
    message: "",
    errorCode: "",
    errorTime: new Date(),
    errorState: undefined,
  });
  const [retryErrorAction, setRetryErrorAction] = useState<
    (() => void) | undefined
  >();

  const showError = useCallback(({ error, retryAction }: ShowErrorParams) => {
    setError(error);
    setIsErrorOpen(true);
    setRetryErrorAction(() => retryAction);
  }, []);

  const hideError = useCallback(() => {
    setIsErrorOpen(false);
    setError({
      message: "",
      errorCode: "",
      errorTime: new Date(),
      errorState: undefined,
    });
    setRetryErrorAction(undefined);
  }, []);

  const value: ErrorContextType = {
    isErrorOpen: isErrorOpen,
    error,
    showError,
    hideError,
    retryErrorAction,
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