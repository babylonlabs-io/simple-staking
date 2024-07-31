import axios from "axios";

interface HealthCheckResponse {
  data: string;
}

export const fetchHealthCheck = async (): Promise<HealthCheckResponse> => {
  const response = await axios.get(
    `${process.env.NEXT_PUBLIC_API_URL}/healthcheck`,
  );
  return response.data;
};
