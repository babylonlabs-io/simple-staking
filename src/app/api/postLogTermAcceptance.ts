import { apiWrapper } from "./apiWrapper";

interface TermsPayload {
  address: string;
  publicKey: string;
}

// postLogTermsAcceptance is used to log the terms acceptance for a given address and public key
export const postLogTermsAcceptance = async ({
  address,
  publicKey,
}: TermsPayload) => {
  const payload: TermsPayload = {
    address: address,
    publicKey: publicKey,
  };

  const response = await apiWrapper(
    "POST",
    "/log-terms-acceptance",
    "Error submitting terms acceptance request",
    payload,
  );

  return response.status === 200;
};
