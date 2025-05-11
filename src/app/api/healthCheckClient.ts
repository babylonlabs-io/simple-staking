import { apiWrapper } from "./apiWrapper";

type HealthCheckResponse = {
  data: string;
};

export const fetchHealthCheck = async (): Promise<HealthCheckResponse> => {
  console.log("E2E: healthcheck fetched");

  // Add debugging info for the URL
  const url = "/healthcheck";
  console.log("E2E: healthcheck requesting URL:", url);

  try {
    const response = await apiWrapper<HealthCheckResponse>(
      "GET",
      url,
      "Error getting healthcheck status",
    );

    console.log("E2E: healthcheck response", JSON.stringify(response, null, 2));
    return response.data;
  } catch (error) {
    console.log("E2E: healthcheck fetch error:", error);
    throw error;
  }
};
