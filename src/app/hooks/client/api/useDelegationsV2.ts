import { useInfiniteQuery } from "@tanstack/react-query";
import { useEffect } from "react";

import {
  getDelegationsV2,
  type PaginatedDelegations,
} from "@/app/api/getDelegationsV2";
import { ONE_MINUTE } from "@/app/constants";
import { useError } from "@/app/context/Error/ErrorProvider";
import { useBTCWallet } from "@/app/context/wallet/BTCWalletProvider";

export const DELEGATIONS_V2_KEY = "DELEGATIONS_V2";

export function useDelegationsV2({
  enabled = true,
}: {
  enabled?: boolean;
} = {}) {
  const { publicKeyNoCoord } = useBTCWallet();
  const { isOpen, handleError } = useError();

  const query = useInfiniteQuery({
    queryKey: [DELEGATIONS_V2_KEY, publicKeyNoCoord],
    queryFn: ({ pageParam = "" }) =>
      getDelegationsV2(publicKeyNoCoord, pageParam),
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
