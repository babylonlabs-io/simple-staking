import { useInfiniteQuery } from "@tanstack/react-query";
import { useEffect } from "react";

import {
  getDelegationsV2,
  type PaginatedDelegations,
} from "@/app/api/getDelegationsV2";
import { ONE_MINUTE } from "@/app/constants";
import { useError } from "@/app/context/Error/ErrorContext";
import { useBTCWallet } from "@/app/context/wallet/BTCWalletProvider";
import { ErrorState } from "@/app/types/errors";

export const DELEGATIONS_V2_KEY = "DELEGATIONS_V2";

export function useDelegationsV2({
  enabled = true,
}: {
  enabled?: boolean;
} = {}) {
  const { publicKeyNoCoord } = useBTCWallet();
  const { isErrorOpen, handleError, captureError } = useError();

  const query = useInfiniteQuery({
    queryKey: [DELEGATIONS_V2_KEY, publicKeyNoCoord],
    queryFn: ({ pageParam = "" }) =>
      getDelegationsV2(pageParam, publicKeyNoCoord),
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
  }, [query.isError, query.error, query.refetch, handleError, captureError]);

  return query;
}
