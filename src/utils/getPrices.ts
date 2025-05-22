import { apiWrapper } from "@/app/api/apiWrapper";
import { ClientError } from "@/errors";
import { ERROR_CODES } from "@/errors/codes";
interface PricesResponse {
  data: Record<string, number>;
}

export const getPrices = async (): Promise<Record<string, number>> => {
  try {
    const response = await apiWrapper<PricesResponse>(
      "GET",
      "/v2/prices",
      "Error getting prices",
    );
    const pricesResponse: PricesResponse = response.data;
    return pricesResponse.data;
  } catch (error) {
    throw new ClientError(
      ERROR_CODES.EXTERNAL_SERVICE_UNAVAILABLE,
      "Error getting prices",
    );
  }
};
