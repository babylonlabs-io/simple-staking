import { apiWrapper } from "./apiWrapper";

const ALLOWED_STATUSES = ["medium", "low"];

export const verifyBTCAddress = async (address: string) => {
  interface AddressScreeningResponse {
    data: {
      btc_address?: {
        risk: string;
      };
    };
  }

  try {
    const { data: response } = await apiWrapper<AddressScreeningResponse>(
      "GET",
      "/address/screening",
      "Error performing BTC address screening",
      { query: { btc_address: address } },
    );

    const risk = response.data?.btc_address?.risk;
    return risk ? ALLOWED_STATUSES.includes(risk.toLowerCase()) : false;
  } catch {
    return false;
  }
};
