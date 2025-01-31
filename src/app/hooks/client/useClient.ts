import {
  type DefaultError,
  DefinedInitialDataOptions,
  DefinedUseQueryResult,
  type QueryKey,
  type UndefinedInitialDataOptions,
  useQuery,
  UseQueryOptions,
  UseQueryResult,
} from "@tanstack/react-query";
import { useEffect } from "react";

import { ONE_MINUTE } from "@/app/constants";
import { useError } from "@/app/context/Error/ErrorProvider";
import { Error } from "@/app/types/errors";

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

  const data = useQuery({
    refetchInterval: ONE_MINUTE,
    retry: (failureCount) => {
      return !isOpen && failureCount <= 3;
    },
    ...options,
  });

  useEffect(() => {
    if (data.isError) {
      const error = data.error as Error;
      handleError({
        error,
        displayOptions: {
          retryAction: data.refetch,
        },
      });
    }
  }, [handleError, data.error, data.isError, data.refetch]);

  return data;
}
