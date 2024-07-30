import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";

import {
  getHealthCheck,
  isGeoBlockedResult,
} from "@/app/services/healthCheckService";
import { HealthCheckStatus } from "@/app/types/services/healthCheck";

import { useError } from "../context/Error/ErrorContext";
import { ErrorState } from "../types/errors";

export const useHealthCheck = () => {
  const { showError } = useError();

  const { data, error, isError, refetch } = useQuery({
    queryKey: ["api available"],
    queryFn: getHealthCheck,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (isError) {
      showError({
        error: {
          message: error.message,
          errorState: ErrorState.SERVER_ERROR,
          errorTime: new Date(),
        },
        retryAction: refetch,
      });
    }
  }, [isError, error, showError, refetch]);

  const isApiNormal = data?.status === HealthCheckStatus.Normal;
  const isGeoBlocked = data ? isGeoBlockedResult(data) : false;
  const apiMessage = data?.message;

  return {
    isApiNormal,
    isGeoBlocked,
    apiMessage,
    isError,
    error,
    refetch,
  };
};
