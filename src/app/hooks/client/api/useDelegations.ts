import { useInfiniteQuery } from "@tanstack/react-query";
import { useEffect } from "react";

import {
  getDelegations,
  type PaginatedDelegations,
} from "@/app/api/getDelegations";
import { ONE_MINUTE } from "@/app/constants";
import { useError } from "@/app/context/Error/ErrorProvider";
import { useBTCWallet } from "@/app/context/wallet/BTCWalletProvider";

export const DELEGATIONS_KEY = "DELEGATIONS";

export function useDelegations({ enabled = true }: { enabled?: boolean } = {}) {
  const { publicKeyNoCoord } = useBTCWallet();
  const { handleError, isOpen } = useError();

  const query = useInfiniteQuery({
    queryKey: [DELEGATIONS_KEY, publicKeyNoCoord],
    queryFn: ({ pageParam = "" }) =>
      getDelegations(pageParam, publicKeyNoCoord),
    getNextPageParam: (lastPage) =>
      lastPage?.pagination?.next_key !== ""
        ? lastPage?.pagination?.next_key
        : null,
    initialPageParam: "",
    refetchInterval: (query) => {
      const totalPages = query.state.data?.pages.length ?? 0;
      if (
        totalPages > 0 &&
        query.state.data?.pages[totalPages - 1].delegations.length === 0
      ) {
        // Stop refetching is there is no data available
        return false;
      }
      return ONE_MINUTE;
    },
    enabled: Boolean(publicKeyNoCoord) && enabled,
    select: (data) => {
      const flattenedData = data.pages.reduce<PaginatedDelegations>(
        (acc, page) => {
          acc.delegations.push(...page.delegations);
          acc.pagination = page.pagination;
          return acc;
        },
        { delegations: [], pagination: { next_key: "" } },
      );

      return flattenedData;
    },
    retry: (failureCount, _error) => {
      return !isOpen && failureCount <= 3;
    },
  });

  useEffect(() => {
    if (query.isError) {
      handleError({
        error: query.error,
        displayOptions: {
          retryAction: query.refetch,
        },
      });
    }
  }, [query.isError, query.error, query.refetch, handleError]);

  return query;
}
