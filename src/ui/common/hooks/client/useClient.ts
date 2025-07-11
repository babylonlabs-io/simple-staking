import {
  DefinedInitialDataOptions,
  DefinedUseQueryResult,
  UseQueryOptions,
  UseQueryResult,
  useQuery,
  type DefaultError,
  type QueryKey,
  type UndefinedInitialDataOptions,
} from "@tanstack/react-query";
import { useEffect } from "react";

import {
  API_DEFAULT_RETRY_COUNT,
  API_DEFAULT_RETRY_DELAY,
  ONE_MINUTE,
  ONE_SECOND,
} from "@/ui/common/constants";
import { useError } from "@/ui/common/context/Error/ErrorProvider";
import { ClientError, ERROR_CODES } from "@/ui/common/errors";
import { useLogger } from "@/ui/common/hooks/useLogger";

export function useClientQuery<
  TQueryFnData = unknown,
  TError = DefaultError,
  TData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey,
>(
  options: DefinedInitialDataOptions<TQueryFnData, TError, TData, TQueryKey>,
): DefinedUseQueryResult<TData, TError>;
export function useClientQuery<
  TQueryFnData = unknown,
  TError = DefaultError,
  TData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey,
>(
  options: UndefinedInitialDataOptions<TQueryFnData, TError, TData, TQueryKey>,
): UseQueryResult<TData, TError>;
export function useClientQuery<
  TQueryFnData = unknown,
  TError = DefaultError,
  TData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey,
>(
  options: UseQueryOptions<TQueryFnData, TError, TData, TQueryKey>,
): UseQueryResult<TData, TError> {
  const { isOpen, handleError } = useError();
  const logger = useLogger();

  const data = useQuery({
    refetchInterval: ONE_MINUTE,
    retry: (failureCount, error) => {
      // Prevent retries for geoblocked errors
      if ((error as ClientError).errorCode === ERROR_CODES.GEO_BLOCK) {
        return false;
      }
      return !isOpen && failureCount < API_DEFAULT_RETRY_COUNT;
    },
    retryDelay: (count) => API_DEFAULT_RETRY_DELAY ** (count + 1) * ONE_SECOND,
    ...options,
  });

  useEffect(() => {
    if (data.isError) {
      const error = data.error as Error;
      const isGeoBlocked =
        (error as ClientError).errorCode === ERROR_CODES.GEO_BLOCK;

      if (isGeoBlocked) {
        return;
      }

      const clientError = new ClientError(
        ERROR_CODES.EXTERNAL_SERVICE_UNAVAILABLE,
        "Error fetching data from the API",
        { cause: error },
      );
      logger.error(clientError);

      handleError({
        error: clientError,
        displayOptions: {
          retryAction: data.refetch,
        },
      });
    }
  }, [handleError, data.error, data.isError, data.refetch, logger]);

  return data;
}
