import { isAxiosError451 } from "../api/error";
import { fetchHealthCheck } from "../api/healthCheckClient";
import {
  API_ERROR_MESSAGE,
  GEO_BLOCK_MESSAGE,
  HealthCheckResult,
  HealthCheckStatus,
} from "../types/services/healthCheck";

export const getHealthCheck = async (): Promise<HealthCheckResult> => {
  try {
    const healthCheckAPIResponse = await fetchHealthCheck();
    if (healthCheckAPIResponse.data) {
      return {
        status: HealthCheckStatus.Normal,
        message: healthCheckAPIResponse.data,
      };
    } else {
      throw new Error(API_ERROR_MESSAGE);
    }
  } catch (error: Error | any) {
    if (isAxiosError451(error)) {
      return {
        status: HealthCheckStatus.GeoBlocked,
        message: error.request?.response?.message || GEO_BLOCK_MESSAGE,
      };
    } else {
      return {
        status: HealthCheckStatus.Error,
        message:
          error.request?.response?.message ||
          error?.message ||
          API_ERROR_MESSAGE,
      };
    }
  }
};

export const isGeoBlocked = (result: HealthCheckResult): boolean => {
  return result.status === HealthCheckStatus.GeoBlocked;
};
