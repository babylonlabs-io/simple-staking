import axios, { isAxiosError } from "axios";

import {
  API_ERROR_MESSAGE,
  GEO_BLOCK_MESSAGE,
  HealthCheckResult,
  HealthCheckStatus,
} from "../types/healthCheck";

interface HealthCheckResponse {
  data: string;
}

export const getHealthCheck = async (): Promise<HealthCheckResult> => {
  try {
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}/healthcheck`,
    );
    const healthCheckAPIResponse: HealthCheckResponse = response.data;
    // If the response has a data field, it's a normal response
    if (healthCheckAPIResponse.data) {
      return {
        status: HealthCheckStatus.Normal,
        message: healthCheckAPIResponse.data,
      };
    } else {
      // Something went wrong
      throw new Error(API_ERROR_MESSAGE);
    }
  } catch (error: Error | any) {
    // Geo-blocking is a custom status code
    if (
      isAxiosError(error) &&
      (error.response?.status === 451 || error.request.status === 451)
    ) {
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
