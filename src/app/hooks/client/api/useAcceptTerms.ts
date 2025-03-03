import { useMutation } from "@tanstack/react-query";
import { useEffect, useRef } from "react";

import { postLogTermsAcceptance } from "@/app/api/postLogTermAcceptance";
import { useBTCWallet } from "@/app/context/wallet/BTCWalletProvider";

// useTermsAcceptance is used to log the terms acceptance for a given address and public key
const useTermsAcceptance = () => {
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

export const useLogTermsOnBtcConnect = () => {
  const { logTermsAcceptance } = useTermsAcceptance();
  const {
    address: btcAddress,
    connected: btcConnected,
    publicKeyNoCoord,
  } = useBTCWallet();
  const hasLoggedRef = useRef(false);

  useEffect(() => {
    if (!btcConnected) {
      hasLoggedRef.current = false;
      return;
    }

    if (btcAddress && publicKeyNoCoord && !hasLoggedRef.current) {
      hasLoggedRef.current = true;
      logTermsAcceptance({ address: btcAddress, public_key: publicKeyNoCoord });
    }
  }, [btcConnected, btcAddress, publicKeyNoCoord, logTermsAcceptance]);
};
