import { useInfiniteQuery } from "@tanstack/react-query";
import { useEffect } from "react";

import {
  getDelegations,
  type PaginatedDelegations,
} from "@/app/api/getDelegations";
import { ONE_MINUTE } from "@/app/constants";
import { useError } from "@/app/context/Error/ErrorContext";
import { useBTCWallet } from "@/app/context/wallet/BTCWalletProvider";
import { ErrorState } from "@/app/types/errors";

export const DELEGATIONS_KEY = "DELEGATIONS";

export function useDelegations({ enabled = true }: { enabled?: boolean } = {}) {
  const { publicKeyNoCoord } = useBTCWallet();
  const { isErrorOpen, handleError, captureError } = useError();

  const query = useInfiniteQuery({
    queryKey: [DELEGATIONS_KEY, publicKeyNoCoord],
    queryFn: ({ pageParam = "" }) =>
      getDelegations(pageParam, publicKeyNoCoord),
    getNextPageParam: (lastPage) =>
      lastPage?.pagination?.next_key !== ""
        ? lastPage?.pagination?.next_key
        : null,
    initialPageParam: "",
    refetchInterval: ONE_MINUTE,
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
  }, [query.isError, query.error, query.refetch, handleError]);

  return query;
}
