import { useEffect } from "react";

import { useError } from "@/app/context/Error/ErrorProvider";
import { useBbnRpc } from "@/app/context/rpc/BbnRpcProvider";
import { useLogger } from "@/app/hooks/useLogger";

/**
 * Hook that handles RPC connection errors by showing an error modal
 * when the connection to the RPC node fails.
 *
 * @returns Object containing a flag indicating if there's an RPC error
 */
export function useRpcErrorHandler() {
  const { error, isLoading, reconnect } = useBbnRpc();
  const { handleError } = useError();
  const logger = useLogger();

  useEffect(() => {
    if (error && !isLoading) {
      logger.error(error);
      handleError({
        error,
        displayOptions: {
          showModal: true,
          retryAction: reconnect,
        },
      });
    }
  }, [error, isLoading, handleError, reconnect, logger]);

  return {
    hasRpcError: Boolean(error) && !isLoading,
    reconnect,
  };
}
