import { apiWrapper } from "./apiWrapper";

interface TermsPayload {
  address: string;
  termsAccepted: boolean;
  publicKey: string;
}

export const postTerms = async (
  address: string,
  termsAccepted: boolean,
  publicKey: string,
) => {
  const payload: TermsPayload = {
    address: address,
    termsAccepted: termsAccepted,
    publicKey: publicKey,
  };

  const response = await apiWrapper(
    "POST",
    "/terms_acceptance",
    "Error submitting terms acceptance request",
    payload,
  );

  return response.status === 200;
};
