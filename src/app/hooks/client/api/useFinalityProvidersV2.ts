import { useInfiniteQuery } from "@tanstack/react-query";
import { useEffect } from "react";

import {
  type PaginatedFinalityProviders,
  getFinalityProvidersV2,
} from "@/app/api/getFinalityProvidersV2";
import { ONE_MINUTE } from "@/app/constants";
import { useError } from "@/app/context/Error/ErrorContext";
import { ErrorState } from "@/app/types/errors";

const FINALITY_PROVIDERS_KEY = "GET_FINALITY_PROVIDERS_V2_KEY";

interface Params {
  pk?: string;
  name?: string;
  sortBy?: string;
  order?: "asc" | "desc";
}

export function useFinalityProvidersV2({
  pk,
  sortBy,
  order,
  name,
}: Params = {}) {
  const { isErrorOpen, handleError, captureError } = useError();

  const query = useInfiniteQuery({
    queryKey: [FINALITY_PROVIDERS_KEY],
    queryFn: ({ pageParam = "" }) =>
      getFinalityProvidersV2({ key: pageParam, pk, sortBy, order, name }),
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
    captureError(query.error);
  }, [query.isError, query.error, query.refetch, handleError, captureError]);

  return query;
}