import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";

import {
  getHealthCheck,
  isGeoBlockedResult,
} from "@/app/services/healthCheckService";
import { HealthCheckStatus } from "@/app/types/services/healthCheck";
import { ClientError, ERROR_CODES } from "@/errors";
import { useLogger } from "@/hooks/useLogger";

import { useError } from "../context/Error/ErrorProvider";

export const useHealthCheck = () => {
  const { handleError } = useError();
  const logger = useLogger();

  const { data, error, isError, isLoading, refetch } = useQuery({
    queryKey: ["api available"],
    queryFn: getHealthCheck,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (isError) {
      const clientError = new ClientError(
        ERROR_CODES.EXTERNAL_SERVICE_UNAVAILABLE,
        (error as Error).message || "Unknown error",
        { cause: error },
      );

      logger.error(clientError, {
        tags: {
          errorCode: clientError.errorCode,
          errorSource: "useHealthCheck",
        },
      });

      handleError({
        error,
        displayOptions: {
          retryAction: refetch,
        },
      });
    }
  }, [isError, error, refetch, handleError]);

  const isApiNormal = data?.status === HealthCheckStatus.Normal;
  const isGeoBlocked = data ? isGeoBlockedResult(data) : false;
  const apiMessage = data?.message;

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
