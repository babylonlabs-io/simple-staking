import { apiWrapper } from "./apiWrapper";

interface TermsPayload {
  address: string;
  public_key: string;
}

const ALLOWED_STATUSES = ["medium", "low"];

export const verifyBTCAddress = async (address: string) => {
  interface AddressScreeningResponse {
    data: {
      btc_address?: {
        risk: string;
      };
    };
  }

  const { data: response } = await apiWrapper<AddressScreeningResponse>(
    "GET",
    "/address/screening",
    "Error verifying BTC address",
    { query: { btc_address: address } },
  );

  const risk = response.data?.btc_address?.risk;
  return risk ? ALLOWED_STATUSES.includes(risk.toLowerCase()) : false;
};
