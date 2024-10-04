import {
  type DefaultError,
  type QueryKey,
  type UndefinedInitialDataOptions,
  useQuery,
} from "@tanstack/react-query";
import { useEffect } from "react";

import { ONE_MINUTE } from "@/app/constants";
import { useError } from "@/app/context/Error/ErrorContext";
import { ErrorState } from "@/app/types/errors";

export function useAPIQuery<
  TQueryFnData = unknown,
  TError extends Error = DefaultError,
  TData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey,
>(
  options: UndefinedInitialDataOptions<TQueryFnData, TError, TData, TQueryKey>,
) {
  const { isErrorOpen, handleError } = useError();

  const data = useQuery({
    refetchInterval: ONE_MINUTE,
    retry: (failureCount) => {
      return !isErrorOpen && failureCount <= 3;
    },
    ...options,
  });

  useEffect(() => {
    handleError({
      error: data.error,
      hasError: data.isError,
      errorState: ErrorState.SERVER_ERROR,
      refetchFunction: data.refetch,
    });
  }, [handleError, data.error, data.isError, data.refetch]);

  return data;
}
