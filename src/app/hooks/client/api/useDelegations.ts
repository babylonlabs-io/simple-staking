import { useInfiniteQuery } from "@tanstack/react-query";
import { useEffect } from "react";

import {
  getDelegations,
  type PaginatedDelegations,
} from "@/app/api/getDelegations";
import {
  API_DEFAULT_RETRY_COUNT,
  API_DEFAULT_RETRY_DELAY,
  ONE_MINUTE,
  ONE_SECOND,
} from "@/app/constants";
import { useError } from "@/app/context/Error/ErrorProvider";
import { useBTCWallet } from "@/app/context/wallet/BTCWalletProvider";
import { ClientError } from "@/errors";
import { ERROR_CODES } from "@/errors/codes";
import { useLogger } from "@/hooks/useLogger";

import { useHealthCheck } from "../../useHealthCheck";

export const DELEGATIONS_KEY = "DELEGATIONS";

export function useDelegations({ enabled = true }: { enabled?: boolean } = {}) {
  const { isGeoBlocked, isLoading } = useHealthCheck();
  const { publicKeyNoCoord } = useBTCWallet();
  const { handleError, isOpen } = useError();
  const logger = useLogger();

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
    enabled:
      Boolean(publicKeyNoCoord) && enabled && !isGeoBlocked && !isLoading,
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
    retry: (failureCount) => !isOpen && failureCount < API_DEFAULT_RETRY_COUNT,
    retryDelay: (count) => API_DEFAULT_RETRY_DELAY ** (count + 1) * ONE_SECOND,
  });

  useEffect(() => {
    if (query.isError) {
      const clientError = new ClientError(
        ERROR_CODES.EXTERNAL_SERVICE_UNAVAILABLE,
        "Error fetching delegations",
      );
      logger.error(clientError, {
        tags: {
          isGeoblocked: isGeoBlocked ? "true" : "false",
        },
        data: {
          userPublicKey: publicKeyNoCoord,
        },
      });
      handleError({
        error: query.error,
        displayOptions: {
          retryAction: query.refetch,
        },
        metadata: {
          userPublicKey: publicKeyNoCoord,
        },
      });
    }
  }, [
    query.isError,
    query.error,
    query.refetch,
    handleError,
    publicKeyNoCoord,
    logger,
    isGeoBlocked,
  ]);

  return query;
}
