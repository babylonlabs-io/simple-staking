import { Network, WalletProvider } from "@babylonlabs-io/bbn-wallet-connect";
import { PropsWithChildren } from "react";

import { ErrorState } from "@/app/types/errors";
import { keplrRegistry } from "@/config/wallet/babylon";

import { useError } from "../../Error/ErrorContext";

import { BBNWalletProvider } from "./BBNWalletProvider";
import { BTCWalletProvider } from "./BTCWalletProvider";

const context = typeof window !== "undefined" ? window : {};
const config = [
  {
    chain: "BTC",
    config: {
      coinName: "Signet BTC",
      coinSymbol: "sBTC",
      networkName: "BTC signet",
      mempoolApiUrl: "https://mempool.space/signet",
      network: Network.SIGNET,
    },
  },
  {
    chain: "BBN",
    config: {
      chainId: keplrRegistry.chainId,
      rpc: keplrRegistry.rpc,
      chainData: keplrRegistry,
    },
  },
] as const;

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
    <WalletProvider config={config} context={context} onError={handleError}>
      <BBNWalletProvider>
        <BTCWalletProvider>{children}</BTCWalletProvider>
      </BBNWalletProvider>
    </WalletProvider>
  );
}
