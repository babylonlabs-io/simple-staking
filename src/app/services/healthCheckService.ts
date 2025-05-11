import { isError451 } from "../api/error";
import { fetchHealthCheck } from "../api/healthCheckClient";
import { HttpStatusCode } from "../api/httpStatusCodes";
import { API_ENDPOINTS } from "../constants/endpoints";
import { ServerError } from "../context/Error/errors/serverError";
import {
  API_ERROR_MESSAGE,
  GEO_BLOCK_MESSAGE,
  HealthCheckResult,
  HealthCheckStatus,
} from "../types/services/healthCheck";

export const getHealthCheck = async (): Promise<HealthCheckResult> => {
  console.log("E2E: healthcheck service");
  try {
    const healthCheckAPIResponse = await fetchHealthCheck();
    console.log("E2E: healthcheck service response", healthCheckAPIResponse);

    if (healthCheckAPIResponse.data) {
      console.log("E2E: healthcheck service data", healthCheckAPIResponse.data);
      return {
        status: HealthCheckStatus.Normal,
        message: healthCheckAPIResponse.data,
      };
    } else {
      console.log("E2E: healthcheck service error");
      throw new ServerError({
        message: API_ERROR_MESSAGE,
        endpoint: API_ENDPOINTS.HEALTHCHECK,
        status: HttpStatusCode.InternalServerError,
      });
    }
  } catch (error: any) {
    console.log("E2E: healthcheck service error 2", { error });
    if (isError451(error)) {
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
