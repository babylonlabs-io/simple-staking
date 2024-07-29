import { useQuery } from "@tanstack/react-query";

import {
  getHealthCheck,
  isGeoBlocked,
} from "@/app/services/healthCheckService";
import { HealthCheckStatus } from "@/app/types/services/healthCheck";

import { useError } from "../context/Error/ErrorContext";

export const useHealthCheck = () => {
  const { showError } = useError();

  const { data, error, isError, refetch } = useQuery({
    queryKey: ["api available"],
    queryFn: getHealthCheck,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

  const isApiNormal = data?.status === HealthCheckStatus.Normal;
  const isBlocked = data ? isGeoBlocked(data) : false;
  const apiMessage = data?.message;

  return {
    isApiNormal,
    isBlocked,
    apiMessage,
    isError,
    error,
    refetch,
  };
};
