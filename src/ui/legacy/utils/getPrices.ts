import { apiWrapper } from "@/ui/legacy/api/apiWrapper";
import { ClientError } from "@/ui/legacy/errors";
import { ERROR_CODES } from "@/ui/legacy/errors/codes";
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
      {
        cause: error as Error,
      },
    );
  }
};
