import { useEffect, useState } from "react";

import { ClientErrorCategory } from "@/app/constants/errorMessages";
import { useError } from "@/app/context/Error/ErrorProvider";
import { ClientError } from "@/app/context/Error/errors/clientError";
import { useClientQuery } from "@/app/hooks/client/useClient";
import { ErrorType } from "@/app/types/errors";
import { Fees } from "@/app/types/fee";
import { getNetworkFees } from "@/utils/mempool_api";

export const NETWORK_FEES_KEY = "NETWORK_FEES";

interface DetailedError extends Error {
  url?: string;
  mockError: boolean;
  timestamp: string;
  statusCode: number;
  details: string;
}

const isDetailedError = (error: any): error is DetailedError => {
  return (
    error &&
    error instanceof Error &&
    "mockError" in error &&
    "timestamp" in error &&
    "details" in error
  );
};

export function useNetworkFees({ enabled = true }: { enabled?: boolean } = {}) {
  const { handleError } = useError();
  const [hasRpcError, setHasRpcError] = useState(false);

  const fetchFees = async (): Promise<Fees> => {
    return getNetworkFees();
  };

  const query = useClientQuery({
    queryKey: [NETWORK_FEES_KEY],
    queryFn: fetchFees,
    enabled,
    retry: 2,
  });

  useEffect(() => {
    if (query.isError) {
      setHasRpcError(true);

      let clientError;

      if (isDetailedError(query.error)) {
        const detailedError = query.error as DetailedError;

        clientError = new ClientError({
          message: `${detailedError.message}${detailedError.details ? ` - ${detailedError.details}` : ""}`,
          category: ClientErrorCategory.RPC_NODE,
          type: ErrorType.SERVER,
        });
      } else {
        clientError =
          query.error instanceof Error
            ? new ClientError({
                message: query.error.message,
                category: ClientErrorCategory.RPC_NODE,
                type: ErrorType.SERVER,
              })
            : query.error;
      }

      handleError({
        error: clientError,
        displayOptions: {
          showModal: true,
          retryAction: () => {
            setHasRpcError(false);
            query.refetch();
          },
        },
        metadata: {
          errorSource: "NETWORK_FEES",
        },
      });
    } else if (query.isSuccess && hasRpcError) {
      setHasRpcError(false);
    }
  }, [
    query.isError,
    query.error,
    query.isSuccess,
    query.refetch,
    handleError,
    hasRpcError,
  ]);

  return {
    ...query,
    hasRpcError,
  };
}
