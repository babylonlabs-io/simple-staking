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
import {
  Error as AppError,
  ErrorHandlerParam,
  ErrorType,
} from "@/app/types/errors";

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
  error: AppError;
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
    ({ error, displayOptions, userInfo }: ErrorHandlerParam) => {
      if (!error) return;

      // Extract stack trace if available
      const stackTrace = error instanceof Error ? error.stack || "" : "";

      const eventId = Sentry.withScope((scope) => {
        if (error instanceof ServerError) {
          scope.setExtras({
            errorType: ErrorType.SERVER,
            endpoint: error.endpoint,
            status: error.status,
            trace: stackTrace,
            ...(userInfo && {
              userPublicKey: userInfo.userPublicKey,
              babylonAddress: userInfo.babylonAddress,
              stakingTxHash: userInfo.stakingTxHash,
              btcAddress: userInfo.btcAddress,
            }),
          });
        } else if (error instanceof ClientError) {
          scope.setExtras({
            errorCategory: error.category,
            errorType: error.type ?? ErrorType.UNKNOWN,
            trace: stackTrace,
            ...(userInfo && {
              userPublicKey: userInfo.userPublicKey,
              babylonAddress: userInfo.babylonAddress,
              stakingTxHash: userInfo.stakingTxHash,
              btcAddress: userInfo.btcAddress,
            }),
          });
        } else {
          scope.setExtras({
            trace: stackTrace,
            ...(userInfo && {
              userPublicKey: userInfo.userPublicKey,
              babylonAddress: userInfo.babylonAddress,
              stakingTxHash: userInfo.stakingTxHash,
              btcAddress: userInfo.btcAddress,
            }),
          });
        }
        return Sentry.captureException(error);
      });

      const errorData = {
        message: error.message,
        sentryEventId: eventId,
        trace: stackTrace,
        ...(userInfo && {
          userPublicKey: userInfo.userPublicKey,
          babylonAddress: userInfo.babylonAddress,
          stakingTxHash: userInfo.stakingTxHash,
          btcAddress: userInfo.btcAddress,
        }),
        ...(error instanceof ClientError && {
          displayMessage: error.displayMessage,
        }),
        ...(error instanceof ServerError && {
          endpoint: error.endpoint,
          displayMessage: error.displayMessage,
        }),
        type: error.type ?? ErrorType.UNKNOWN,
      };

      setState({
        isOpen: true,
        error: errorData,
        modalOptions: {
          retryAction: displayOptions?.retryAction,
          noCancel: displayOptions?.noCancel ?? false,
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
      <ErrorModal />
    </ErrorContext.Provider>
  );
};

export const useError = () => useContext(ErrorContext);
