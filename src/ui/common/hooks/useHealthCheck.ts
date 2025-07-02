import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";

import { ClientError, ERROR_CODES } from "@/ui/common/errors";
import { useLogger } from "@/ui/common/hooks/useLogger";
import { getHealthCheck } from "@/ui/common/services/healthCheckService";
import { HealthCheckStatus } from "@/ui/common/types/services/healthCheck";

import { useError } from "../context/Error/ErrorProvider";

export const HEALTH_CHECK_KEY = "HEALTH_CHECK";

export const useHealthCheck = () => {
  const { handleError } = useError();
  const logger = useLogger();

  const { data, error, isError, isLoading, refetch } = useQuery({
    queryKey: [HEALTH_CHECK_KEY],
    queryFn: getHealthCheck,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    retry: (_, error) => {
      // Prevent retries for geoblocked errors
      return (error as ClientError).errorCode !== ERROR_CODES.GEO_BLOCK;
    },
  });

  const isApiNormal = data?.status === HealthCheckStatus.Normal;
  const isGeoBlocked = error
    ? (error as ClientError).errorCode === ERROR_CODES.GEO_BLOCK
    : false;
  const apiMessage = data?.message;

  useEffect(() => {
    if (isError) {
      if (isGeoBlocked) {
        return;
      }

      logger.error(error);

      handleError({
        error,
        displayOptions: {
          retryAction: refetch,
        },
      });
    }
  }, [isError, error, refetch, handleError, logger, isGeoBlocked]);

  return {
    isApiNormal,
    isGeoBlocked,
    apiMessage,
    isError,
    error,
    isLoading,
    refetch,
  };
};
