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
import { useError } from "@/app/context/Error/ErrorContext";
import { ErrorState } from "@/app/types/errors";

export function useAPIQuery<
  TQueryFnData = unknown,
  TError = DefaultError,
  TData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey,
>(
  options: DefinedInitialDataOptions<TQueryFnData, TError, TData, TQueryKey>,
): DefinedUseQueryResult<TData, TError>;
export function useAPIQuery<
  TQueryFnData = unknown,
  TError = DefaultError,
  TData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey,
>(
  options: UndefinedInitialDataOptions<TQueryFnData, TError, TData, TQueryKey>,
): UseQueryResult<TData, TError>;
export function useAPIQuery<
  TQueryFnData = unknown,
  TError = DefaultError,
  TData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey,
>(
  options: UseQueryOptions<TQueryFnData, TError, TData, TQueryKey>,
): UseQueryResult<TData, TError> {
  const { isErrorOpen, handleError, captureError } = useError();

  const data = useQuery({
    refetchInterval: ONE_MINUTE,
    retry: (failureCount) => {
      return !isErrorOpen && failureCount <= 3;
    },
    ...options,
  });

  useEffect(() => {
    handleError({
      error: data.error as Error,
      hasError: data.isError,
      errorState: ErrorState.SERVER_ERROR,
      refetchFunction: data.refetch,
    });
    captureError(data.error as Error);
  }, [handleError, data.error, data.isError, data.refetch, captureError]);

  return data;
}
