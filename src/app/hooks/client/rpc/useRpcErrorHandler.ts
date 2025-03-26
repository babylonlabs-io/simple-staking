import { useCallback, useEffect } from "react";

import { ClientErrorCategory } from "@/app/constants/errorMessages";
import { useError } from "@/app/context/Error/ErrorProvider";
import { ClientError } from "@/app/context/Error/errors/clientError";
import { useBbnRpc } from "@/app/context/rpc/BbnRpcProvider";
import { ErrorType } from "@/app/types/errors";

/**
 * Hook that handles RPC connection errors by showing an error modal
 * when the connection to the RPC node fails.
 *
 * @returns Object containing a flag indicating if there's an RPC error
 */
export function useRpcErrorHandler() {
  const { error, isLoading } = useBbnRpc();
  const { handleError } = useError();

  const reconnect = useCallback(() => {
    window.location.reload();
  }, []);

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
    hasRpcError: Boolean(error) && !isLoading,
    reconnect,
  };
}
