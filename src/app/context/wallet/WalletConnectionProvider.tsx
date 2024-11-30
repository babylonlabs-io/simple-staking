"use client";

import { Network, WalletProvider } from "@babylonlabs-io/bbn-wallet-connect";
import { type PropsWithChildren } from "react";

import { ErrorState } from "@/app/types/errors";
import { bbnDevnet } from "@/config/wallet/babylon";

import { useError } from "../Error/ErrorContext";

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
      chainId: bbnDevnet.chainId,
      rpc: bbnDevnet.rpc,
      chainData: bbnDevnet,
    },
  },
] as const;

export const WalletConnectionProvider = ({ children }: PropsWithChildren) => {
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
      {children}
    </WalletProvider>
  );
};
