import { useEffect } from "react";

import { postLogTermsAcceptance } from "@/app/api/postLogTermAcceptance";
import { useBTCWallet } from "@/app/context/wallet/BTCWalletProvider";
import { useTermsContext } from "@/app/context/wallet/LifecycleProvider";

export const useAcceptTerms = () => {
  const { hasAcceptedTerms, clearTerms } = useTermsContext();
  const {
    address: btcAddress,
    connected: btcConnected,
    publicKeyNoCoord,
  } = useBTCWallet();

  useEffect(() => {
    if (hasAcceptedTerms && btcConnected && btcAddress && publicKeyNoCoord) {
      const sendTermsAcceptance = async () => {
        try {
          await postLogTermsAcceptance({
            address: btcAddress,
            public_key: publicKeyNoCoord,
          });
          clearTerms();
        } catch (error) {}
      };

      sendTermsAcceptance();
    }
  }, [
    hasAcceptedTerms,
    btcConnected,
    btcAddress,
    publicKeyNoCoord,
    clearTerms,
  ]);

  return { hasAcceptedTerms };
};
