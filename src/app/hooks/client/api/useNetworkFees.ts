import { useEffect, useState } from "react";

import { ClientErrorCategory } from "@/app/constants/errorMessages";
import { useError } from "@/app/context/Error/ErrorProvider";
import { ClientError } from "@/app/context/Error/errors/clientError";
import { useClientQuery } from "@/app/hooks/client/useClient";
import { ErrorType } from "@/app/types/errors";
import { Fees } from "@/app/types/fee";
import { mockConfig } from "@/utils/__mocks__/mempool_api";
import { getNetworkFees } from "@/utils/mempool_api";

export const NETWORK_FEES_KEY = "NETWORK_FEES";

/**
 * Extended error interface for our mock errors
 */
interface DetailedError extends Error {
  url?: string;
  mockError: boolean;
  timestamp: string;
  statusCode: number;
  details: string;
}

// Function to check if we're in a mocked environment
const isMockingEnabled = () => {
  return (
    process.env.NODE_ENV === "development" && typeof window !== "undefined"
  );
};

// Helper to determine if an error is a detailed mock error
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

  // Modified query function to directly respect mockConfig
  const mockAwareFetchFees = async (): Promise<Fees> => {
    // Check if we should simulate an error
    if (isMockingEnabled() && mockConfig.shouldFailNetworkFees) {
      console.log("🧪 Simulating network fee error directly in hook");
      setHasRpcError(true);

      // Create a detailed error
      const error = new Error(
        "Network error: Failed to fetch network fees (simulated)",
      ) as DetailedError;
      error.mockError = true;
      error.timestamp = new Date().toISOString();
      error.statusCode = 503;
      error.details =
        "This is a simulated network error from the Error Simulator";

      console.error("🔴 Mock Hook Error:", {
        message: error.message,
        timestamp: error.timestamp,
        statusCode: error.statusCode,
        details: error.details,
      });

      throw error;
    }

    // Otherwise use the normal fetch function
    return getNetworkFees();
  };

  const query = useClientQuery({
    queryKey: [NETWORK_FEES_KEY],
    queryFn: mockAwareFetchFees,
    enabled,
    retry: 2,
  });

  useEffect(() => {
    if (query.isError) {
      setHasRpcError(true);

      let clientError;

      // Handle detailed errors with additional information
      if (isDetailedError(query.error)) {
        const detailedError = query.error as DetailedError;
        console.log("⚠️ Handling detailed error:", {
          message: detailedError.message,
          timestamp: detailedError.timestamp,
          details: detailedError.details,
          mockError: detailedError.mockError,
        });

        clientError = new ClientError({
          message: `${detailedError.message}${detailedError.details ? ` - ${detailedError.details}` : ""}`,
          category: ClientErrorCategory.RPC_NODE,
          type: ErrorType.SERVER,
        });
      } else {
        // Transform the error to provide better context
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
