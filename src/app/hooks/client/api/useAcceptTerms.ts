import { useEffect, useRef } from "react";

import { postLogTermsAcceptance } from "@/app/api/postLogTermAcceptance";
import { useBTCWallet } from "@/app/context/wallet/BTCWalletProvider";

export const useAcceptTerms = () => {
  const {
    address: btcAddress,
    connected: btcConnected,
    publicKeyNoCoord,
  } = useBTCWallet();

  const prevConnectedRef = useRef<boolean>(false);

  useEffect(() => {
    if (
      btcConnected &&
      !prevConnectedRef.current &&
      btcAddress &&
      publicKeyNoCoord
    ) {
      postLogTermsAcceptance({
        address: btcAddress,
        public_key: publicKeyNoCoord,
      });
    }

    prevConnectedRef.current = btcConnected;
  }, [btcConnected, btcAddress, publicKeyNoCoord]);
};
