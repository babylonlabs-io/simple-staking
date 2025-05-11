import { useEffect } from "react";

import { useError } from "@/app/context/Error/ErrorProvider";
import { useBbnRpc } from "@/app/context/rpc/BbnRpcProvider";
import { ClientError, ERROR_CODES } from "@/errors";

/**
 * Hook that handles RPC connection errors by showing an error modal
 * when the connection to the RPC node fails.
 *
 * @returns Object containing a flag indicating if there's an RPC error
 */
export function useRpcErrorHandler() {
  const { error, isLoading, reconnect } = useBbnRpc();
  const { handleError } = useError();

  useEffect(() => {
    if (error && !isLoading) {
      const clientError = new ClientError(
        ERROR_CODES.EXTERNAL_SERVICE_UNAVAILABLE,
        error.message,
        { cause: error as Error },
      );

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
    hasRpcError: Boolean(error) && !isLoading,
    reconnect,
  };
}
