import { useInfiniteQuery } from "@tanstack/react-query";
import { useEffect } from "react";

import {
  getFinalityProvidersV2,
  type PaginatedFinalityProviders,
} from "@/ui/common/api/getFinalityProvidersV2";
import {
  API_DEFAULT_RETRY_COUNT,
  API_DEFAULT_RETRY_DELAY,
  ONE_MINUTE,
  ONE_SECOND,
} from "@/ui/common/constants";
import { useError } from "@/ui/common/context/Error/ErrorProvider";
import { useLogger } from "@/ui/common/hooks/useLogger";

const FINALITY_PROVIDERS_KEY = "GET_FINALITY_PROVIDERS_V2_KEY";

interface Params {
  pk?: string;
  name?: string;
  sortBy?: string;
  order?: "asc" | "desc";
  bsnId?: string;
  enabled?: boolean;
}

export function useFinalityProvidersV2({
  pk,
  sortBy,
  order,
  name,
  bsnId,
  enabled,
}: Params = {}) {
  const { isOpen, handleError } = useError();
  const logger = useLogger();

  const query = useInfiniteQuery({
    queryKey: [FINALITY_PROVIDERS_KEY, pk, sortBy, order, name, bsnId],
    queryFn: ({ pageParam = "" }) =>
      getFinalityProvidersV2({
        key: pageParam,
        pk,
        sortBy,
        order,
        name,
        bsnId,
      }),
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
    enabled,
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
