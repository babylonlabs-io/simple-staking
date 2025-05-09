import { apiWrapper } from "./apiWrapper";

type HealthCheckResponse = {
  data: string;
};

export const fetchHealthCheck = async (): Promise<HealthCheckResponse> => {
  console.log("fetchHealthCheck");
  const response = await apiWrapper<HealthCheckResponse>(
    "GET",
    "/healthcheck",
    "Error getting healthcheck status",
  );

  return response.data;
};
