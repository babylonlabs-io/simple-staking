import { useMutation } from "@tanstack/react-query";

import { postLogTermsAcceptance } from "@/app/api/postLogTermAcceptance";

// useTermsAcceptance is used to log the terms acceptance for a given address and public key
export const useTermsAcceptance = () => {
  const mutation = useMutation({
    mutationFn: postLogTermsAcceptance,
    retry: 3,
    retryDelay: 1500,
  });

  const logTermsAcceptance = async ({
    address,
    public_key,
  }: {
    address: string;
    public_key: string;
  }) => {
    await mutation.mutateAsync({ address, public_key });
  };

  return { logTermsAcceptance };
};
