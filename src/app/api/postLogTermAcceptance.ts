import { encode } from "url-safe-base64";

import { apiWrapper } from "./apiWrapper";

interface TermsPayload {
  address: string;
  public_key: string;
}

// postLogTermsAcceptance is used to log the terms acceptance for a given address and public key
export const postLogTermsAcceptance = async ({
  address,
  public_key,
}: TermsPayload) => {
  const payload: TermsPayload = {
    address: address,
    public_key: encode(public_key),
  };

  const response = await apiWrapper(
    "POST",
    "/log-terms-acceptance",
    "Error submitting terms acceptance request",
    { body: payload },
  );

  return response.status === 200;
};
