import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";

import {
  getHealthCheck,
  isGeoBlockedResult,
} from "@/app/services/healthCheckService";
import { HealthCheckStatus } from "@/app/types/services/healthCheck";

import { useError } from "../context/Error/ErrorProvider";

export const useHealthCheck = () => {
  const { handleError } = useError();

  const { data, error, isError, isLoading, refetch } = useQuery({
    queryKey: ["api available"],
    queryFn: getHealthCheck,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (isError) {
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
