import * as Sentry from "@sentry/nextjs";
import React, {
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

import { ErrorModal } from "@/app/components/Modals/ErrorModal";
import { Error, ErrorHandlerParam } from "@/app/types/errors";

import { ClientError, ServerError } from "./errors";

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
  error: Error;
  modalOptions: {
    retryAction?: () => void;
    noCancel?: boolean;
  };
};

type ErrorContextType = {
  dismissError: () => void;
  handleError: (params: ErrorHandlerParam) => void;
} & ErrorState;

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
    ({ error, displayError }: ErrorHandlerParam) => {
      if (!error) return;

      const eventId = Sentry.withScope((scope) => {
        if (error instanceof ServerError) {
          scope.setExtras({
            errorType: "SERVER_ERROR",
            endpoint: error.endpoint,
            status: error.status,
          });
        } else if (error instanceof ClientError) {
          scope.setExtras({
            errorCode: error.errorCode,
            errorType: error.errorType,
          });
        }
        return Sentry.captureException(error);
      });

      const errorData = {
        message: error.message,
        sentryEventId: eventId,
        ...(error instanceof ClientError && {
          displayMessage: error.displayMessage,
        }),
        ...(error instanceof ServerError && {
          endpoint: error.endpoint,
          displayMessage: error.displayMessage,
        }),
        errorState: displayError.errorState,
      };

      setState({
        isOpen: true,
        error: errorData,
        modalOptions: {
          retryAction: displayError.retryAction,
          noCancel: displayError.noCancel ?? false,
        },
      });
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
      <ErrorModal
        open={state.isOpen}
        errorMessage={state.error.message}
        errorState={state.error.errorState}
        onClose={dismissError}
        onRetry={state.modalOptions.retryAction}
        noCancel={state.modalOptions.noCancel}
      />
    </ErrorContext.Provider>
  );
};

export const useError = () => useContext(ErrorContext);
