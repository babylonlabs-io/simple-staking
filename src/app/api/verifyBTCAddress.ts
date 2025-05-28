const ALLOWED_STATUSES = ["medium", "low"];

export const verifyBTCAddress = async (address: string) => {
  interface AddressScreeningResponse {
    data: {
      btc_address?: {
        risk: string;
      };
    };
  }
  return true;
};
