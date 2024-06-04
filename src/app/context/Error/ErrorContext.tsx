import React, {
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useState,
} from "react";

import { ErrorType, ShowErrorParams } from "@/app/types/errors";

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

export const ErrorProvider: React.FC<ErrorProviderProps> = ({ children }) => {
  const [isErrorOpen, setIsErrorOpen] = useState(false);
  const [error, setError] = useState<ErrorType>({
    message: "",
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
    setTimeout(() => {
      setError({
        message: "",
        errorTime: new Date(),
        errorState: undefined,
      });
      setRetryErrorAction(undefined);
    }, 300);
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
