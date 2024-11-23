import { WalletProvider } from "@babylonlabs-io/bbn-wallet-connect";
import { PropsWithChildren } from "react";

import { ErrorState } from "@/app/types/errors";
import { getNetworkConfig } from "@/config/network.config";

import { useError } from "../../Error/ErrorContext";

import { BTCWalletProvider } from "./BTCWalletProvider";
import { walletWidgets } from "./widgets";

const context = typeof window !== "undefined" ? window : {};

export function NativeProvider({ children }: PropsWithChildren) {
  const { showError, captureError } = useError();

  const handleError = (e: Error) => {
    showError({
      error: {
        message: e.message,
        errorState: ErrorState.WALLET,
      },
    });
    captureError(e);
  };

  return (
    <WalletProvider
      config={getNetworkConfig()}
      context={context}
      walletWidgets={walletWidgets}
      onError={handleError}
    >
      <BTCWalletProvider>{children}</BTCWalletProvider>
    </WalletProvider>
  );
}
