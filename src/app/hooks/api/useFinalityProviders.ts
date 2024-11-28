import { useInfiniteQuery } from "@tanstack/react-query";
import { useEffect } from "react";

import {
  type PaginatedFinalityProviders,
  getFinalityProviders,
} from "@/app/api/getFinalityProviders";
import { ONE_MINUTE } from "@/app/constants";
import { useError } from "@/app/context/Error/ErrorContext";
import { ErrorState } from "@/app/types/errors";

const FINALITY_PROVIDERS_KEY = "GET_FINALITY_PROVIDERS_KEY";

export function useFinalityProviders() {
  const { isErrorOpen, handleError } = useError();

  const query = useInfiniteQuery({
    queryKey: [FINALITY_PROVIDERS_KEY],
    queryFn: ({ pageParam = "" }) => getFinalityProviders(pageParam),
    getNextPageParam: (lastPage) =>
      lastPage?.pagination?.next_key !== ""
        ? lastPage?.pagination?.next_key
        : null,
    initialPageParam: "",
    refetchInterval: ONE_MINUTE,
    placeholderData: (prev) => prev,
    select: (data) => {
      const flattenedData = data.pages.reduce<PaginatedFinalityProviders>(
        (acc, page) => {
          acc.finalityProviders.push(...page.finalityProviders);
          acc.pagination = page.pagination;
          return acc;
        },
        { finalityProviders: [], pagination: { next_key: "" } },
      );
      return flattenedData;
    },
    retry: (failureCount) => {
      return !isErrorOpen && failureCount <= 3;
    },
  });

  useEffect(() => {
    handleError({
      error: query.error,
      hasError: query.isError,
      errorState: ErrorState.SERVER_ERROR,
      refetchFunction: query.refetch,
    });
  }, [query.isError, query.error, query.refetch, handleError]);

  return query;
}
