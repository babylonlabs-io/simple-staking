import { apiWrapper } from "@/app/api/apiWrapper";

interface PricesResponse {
  data: Record<string, number>;
}

export const getPrices = async (): Promise<Record<string, number>> => {
  const response = await apiWrapper(
    "GET",
    "/v2/prices",
    "Error getting prices",
  );
  const pricesResponse: PricesResponse = response.data;
  return pricesResponse.data;
};
