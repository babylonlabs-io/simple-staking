import { apiWrapper } from "./apiWrapper";

interface TermsPayload {
  address: string;
  public_key: string;
}

const ALLOWED_STATUSES = ["medium", "low"];

export const verifyBTCAddress = async (address: string) => {
  const { data: response } = await apiWrapper(
    "GET",
    "/address/screening",
    "Error verifying BTC address",
    { query: { btc_address: address } },
  );

  return ALLOWED_STATUSES.includes(
    response.data?.btc_address?.risk?.toLowerCase(),
  );
};
