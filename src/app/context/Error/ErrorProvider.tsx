import React, {
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

import { ErrorModal } from "@/app/components/Modals/ErrorModal";
import { Error as AppError, ErrorHandlerParam } from "@/app/types/errors";

const ErrorContext = createContext<ErrorContextType>({
  isOpen: false,
  error: {
    message: "",
  },
  modalOptions: {},
  dismissError: () => {},
  handleError: () => {},
});

interface ErrorProviderProps {
  children: ReactNode;
}

type ErrorState = {
  isOpen: boolean;
  error: AppError;
  modalOptions: {
    retryAction?: () => void;
    noCancel?: boolean;
  };
};

export type ErrorContextType = ErrorState & {
  dismissError: () => void;
  handleError: (param: ErrorHandlerParam) => void;
};

export const ErrorProvider: React.FC<ErrorProviderProps> = ({ children }) => {
  const [state, setState] = useState<ErrorState>({
    isOpen: false,
    error: { message: "" },
    modalOptions: {},
  });

  const dismissError = useCallback(() => {
    setState((prev) => ({ ...prev, isOpen: false }));
    setTimeout(() => {
      setState({ isOpen: false, error: { message: "" }, modalOptions: {} });
    }, 300);
  }, []);

  const handleError = useCallback(
    ({ error, displayOptions, metadata }: ErrorHandlerParam) => {
      if (!error) return;

      // Extract stack trace if available
      const stackTrace = error instanceof Error ? error.stack || "" : "";

      // Get error source from metadata if available
      const paramErrorSource = metadata?.errorSource as string | undefined;
      const errorSource: string | undefined = paramErrorSource;

      const combinedMetadata = {
        errorSource: errorSource,
        ...metadata,
      };

      const shouldShowModal = displayOptions?.showModal ?? true;

      const errorData = {
        message: error.message,
        trace: stackTrace,
        ...combinedMetadata,
      };

      if (shouldShowModal) {
        setState({
          isOpen: true,
          error: errorData,
          modalOptions: {
            retryAction: displayOptions?.retryAction,
            noCancel: displayOptions?.noCancel ?? false,
          },
        });
      }
    },
    [],
  );

  const contextValue = useMemo(
    () => ({
      ...state,
      dismissError,
      handleError,
    }),
    [state, dismissError, handleError],
  );

  return (
    <ErrorContext.Provider value={contextValue}>
      {children}
      <ErrorModal />
    </ErrorContext.Provider>
  );
};
export const useError = () => useContext(ErrorContext);
