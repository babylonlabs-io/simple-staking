import { useCallback, useEffect } from "react";

import { ClientErrorCategory } from "@/app/constants/errorMessages";
import { useError } from "@/app/context/Error/ErrorProvider";
import { ClientError } from "@/app/context/Error/errors/clientError";
import { useBbnRpc } from "@/app/context/rpc/BbnRpcProvider";
import { ErrorType } from "@/app/types/errors";

// MOCK: Set to true for immediate testing, false for normal operation
const FORCE_ERROR_MODAL = true;

/**
 * Hook that handles RPC connection errors by showing an error modal
 * when the connection to the RPC node fails.
 *
 * @returns Object containing a flag indicating if there's an RPC error
 */
export function useRpcErrorHandler() {
  const { error, isLoading } = useBbnRpc();
  const { handleError } = useError();

  // Force window reload to attempt reconnection to RPC
  const reconnect = useCallback(() => {
    window.location.reload();
  }, []);

  // For testing: Force error modal to appear
  useEffect(() => {
    if (FORCE_ERROR_MODAL) {
      const mockError = new Error(
        "MOCK RPC CONNECTION ERROR: This is a simulated RPC connection failure for testing purposes",
      );
      const clientError = new ClientError({
        message: mockError.message,
        category: ClientErrorCategory.RPC_NODE,
        type: ErrorType.SERVER,
      });

      // Use setTimeout to ensure this runs after initial render
      const timeoutId = setTimeout(() => {
        handleError({
          error: clientError,
          displayOptions: {
            showModal: true,
            retryAction: reconnect,
          },
          metadata: {
            errorSource: "MOCK_RPC_CONNECTION",
          },
        });
      }, 1000);

      return () => clearTimeout(timeoutId);
    }
  }, [handleError, reconnect]);

  useEffect(() => {
    if (error && !isLoading) {
      const clientError = new ClientError({
        message: error.message,
        category: ClientErrorCategory.RPC_NODE,
        type: ErrorType.SERVER,
      });

      handleError({
        error: clientError,
        displayOptions: {
          showModal: true,
          retryAction: reconnect,
        },
        metadata: {
          errorSource: "RPC_CONNECTION",
        },
      });
    }
  }, [error, isLoading, handleError, reconnect]);

  return {
    hasRpcError: (Boolean(error) && !isLoading) || FORCE_ERROR_MODAL,
    reconnect,
  };
}
