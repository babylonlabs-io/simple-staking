interface HealthCheckResponse {
  data: string;
}

export const fetchHealthCheck = async (): Promise<HealthCheckResponse> => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/healthcheck`,
  );

  if (!response.ok) {
    throw new Error(`Health check failed with status: ${response.status}`);
  }

  return await response.json();
};
