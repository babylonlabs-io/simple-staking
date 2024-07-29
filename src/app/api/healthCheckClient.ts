import axios, { isAxiosError } from "axios";

interface HealthCheckResponse {
  data: string;
}

export const fetchHealthCheck = async (): Promise<HealthCheckResponse> => {
  const response = await axios.get(
    `${process.env.NEXT_PUBLIC_API_URL}/healthcheck`,
  );
  return response.data;
};

export const isAxiosError451 = (error: any): boolean => {
  return (
    isAxiosError(error) &&
    (error.response?.status === 451 || error.request.status === 451)
  );
};
