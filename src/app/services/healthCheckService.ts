import { HttpStatusCode } from "axios";

import { isAxiosError451 } from "../api/error";
import { fetchHealthCheck } from "../api/healthCheckClient";
import { API_ENDPOINTS } from "../constants/endpoints";
import { ServerError } from "../context/Error/errors/serverError";
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
      throw new ServerError({
        message: API_ERROR_MESSAGE,
        endpoint: API_ENDPOINTS.HEALTHCHECK,
        status: HttpStatusCode.InternalServerError,
      });
    }
  } catch (error: any) {
    if (isAxiosError451(error)) {
      return {
        status: HealthCheckStatus.GeoBlocked,
        message: GEO_BLOCK_MESSAGE,
      };
    } else {
      return {
        status: HealthCheckStatus.Error,
        message: error.response?.message || error?.message || API_ERROR_MESSAGE,
      };
    }
  }
};

export const isGeoBlockedResult = (result: HealthCheckResult): boolean => {
  return result.status === HealthCheckStatus.GeoBlocked;
};
