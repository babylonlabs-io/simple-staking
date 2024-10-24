import { useEffect } from "react";
import { useLocalStorage } from "usehooks-ts";

import { postTerms } from "@/app/api/postTerms";
import { useError } from "@/app/context/Error/ErrorContext";
import { ErrorState } from "@/app/types/errors";

export const useAcceptTerms = (address: string, publicKeyNoCoord: string) => {
  const [termsAcceptedAddresses, setTermsAcceptedAddresses] = useLocalStorage<
    Record<string, boolean>
  >("termsAcceptedAddresses", {});
  const { handleError } = useError();

  const isTermsAccepted = address ? termsAcceptedAddresses[address] : false;

  useEffect(() => {
    const acceptTerms = async () => {
      if (address && publicKeyNoCoord && !isTermsAccepted) {
        try {
          await postTerms(address, true, publicKeyNoCoord);
          setTermsAcceptedAddresses((prev) => ({ ...prev, [address]: true }));
        } catch (error: Error | any) {
          handleError({
            error: error,
            hasError: true,
            errorState: ErrorState.TERMS,
            refetchFunction: () => acceptTerms(),
          });
        }
      }
    };

    acceptTerms();
  }, [
    address,
    publicKeyNoCoord,
    isTermsAccepted,
    setTermsAcceptedAddresses,
    handleError,
  ]);

  const clearTermsAccepted = (address: string) => {
    setTermsAcceptedAddresses((prev) => ({ ...prev, [address]: false }));
  };

  return { isTermsAccepted, clearTermsAccepted };
};
