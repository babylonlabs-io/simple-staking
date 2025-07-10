import { useInfiniteQuery } from "@tanstack/react-query";
import { useEffect } from "react";

import {
  getFinalityProviders,
  type PaginatedFinalityProviders,
} from "@/ui/common/api/getFinalityProviders";
import {
  API_DEFAULT_RETRY_COUNT,
  API_DEFAULT_RETRY_DELAY,
  ONE_MINUTE,
  ONE_SECOND,
} from "@/ui/common/constants";
import { useError } from "@/ui/common/context/Error/ErrorProvider";
import { useLogger } from "@/ui/common/hooks/useLogger";

const FINALITY_PROVIDERS_KEY = "GET_FINALITY_PROVIDERS_V1_KEY";

interface Params {
  pk?: string;
  name?: string;
  sortBy?: string;
  order?: "asc" | "desc";
}

export function useFinalityProviders({ pk, sortBy, order, name }: Params = {}) {
  const { isOpen, handleError } = useError();
  const logger = useLogger();

  const query = useInfiniteQuery({
    queryKey: [FINALITY_PROVIDERS_KEY, pk, sortBy, order, name],
    queryFn: ({ pageParam = "" }) =>
      getFinalityProviders({ key: pageParam, pk, sortBy, order, name }),
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
    retry: (failureCount) => !isOpen && failureCount < API_DEFAULT_RETRY_COUNT,
    retryDelay: (count) => API_DEFAULT_RETRY_DELAY ** (count + 1) * ONE_SECOND,
  });

  useEffect(() => {
    if (query.isError) {
      logger.error(query.error);
      handleError({
        error: query.error,
        displayOptions: {
          retryAction: query.refetch,
        },
      });
    }
  }, [query.isError, query.error, query.refetch, handleError, logger]);

  return query;
}
