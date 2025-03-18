import { encode } from "url-safe-base64";

import { getPublicKeyNoCoord } from "@/utils/wallet";

import { apiWrapper } from "./apiWrapper";

interface TermsPayload {
  address: string;
  public_key: string;
}

// postLogTermsAcceptance is used to log the terms acceptance for a given address and public key
export const logTermsAcceptance = async ({
  address,
  public_key,
}: TermsPayload) => {
  const payload: TermsPayload = {
    address: address,
    public_key: encode(getPublicKeyNoCoord(public_key).toString("hex")),
  };

  const response = await apiWrapper<unknown>(
    "POST",
    "/log-terms-acceptance",
    "Error submitting terms acceptance request",
    { body: payload },
  );
};
