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
} from "@/app/constants";
import { useError } from "@/app/context/Error/ErrorProvider";
import { ClientError, ERROR_CODES } from "@/errors";
import { useLogger } from "@/hooks/useLogger";

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
    retry: (failureCount) => !isOpen && failureCount < API_DEFAULT_RETRY_COUNT,
    retryDelay: (count) => API_DEFAULT_RETRY_DELAY ** (count + 1) * ONE_SECOND,
    ...options,
  });

  useEffect(() => {
    if (data.isError) {
      const error = new ClientError(
        ERROR_CODES.EXTERNAL_SERVICE_UNAVAILABLE,
        (data.error as Error).message || "Unknown error",
        { cause: data.error },
      );
      logger.error(error);
      handleError({
        error,
        displayOptions: {
          retryAction: data.refetch,
        },
      });
    }
  }, [
    handleError,
    data.error,
    data.isError,
    data.refetch,
    logger,
    options.queryKey,
  ]);

  return data;
}
