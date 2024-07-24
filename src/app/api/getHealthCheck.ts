import { isAxiosError } from "axios";

import { HealthCheckResult } from "../types/healthCheck";

import { apiWrapper } from "./apiWrapper";

interface HealthCheckResponse {
  data: string;
}

export const getHealthCheck = async (): Promise<HealthCheckResult> => {
  try {
    const response = await apiWrapper(
      "GET",
      "/healthcheck",
      "Error checking health",
    );
    const healthCheckAPIResponse: HealthCheckResponse = response.data;
    // If the response has a data field, it's a normal response
    if (healthCheckAPIResponse.data) {
      return { status: "normal", message: healthCheckAPIResponse.data };
    } else {
      // Something went wrong
      throw new Error("Health check failed");
    }
  } catch (error: Error | any) {
    // Geo-blocking is a custom status code
    if (
      isAxiosError(error) &&
      (error.response?.status === 451 || error.request.status === 451)
    ) {
      return {
        status: "geoBlocked",
        message:
          "The Bitcoin Staking functionality is not available in your region",
      };
    } else {
      return {
        status: "error",
        message: "Please try again later",
      };
    }
  }
};
