"use client";

import {
  ChainConfigArr,
  WalletProvider,
} from "@babylonlabs-io/bbn-wallet-connect";
import { type PropsWithChildren } from "react";

import { ConnectButton } from "@/app/context/tomo/ConnectButton";
import { TomoConnectionProvider } from "@/app/context/tomo/TomoProvider";
import { ErrorState } from "@/app/types/errors";
import { getNetworkConfigBBN } from "@/config/network/bbn";
import { getNetworkConfigBTC } from "@/config/network/btc";

import { useError } from "../Error/ErrorContext";
import { TomoBBNConnector } from "../tomo/BBNConnector";
import { TomoBTCConnector } from "../tomo/BTCConnector";

const context = typeof window !== "undefined" ? window : {};
const config: ChainConfigArr = [
  {
    chain: "BTC",
    connectors: [
      {
        id: "tomo-btc-connector",
        widget: () => <ConnectButton chainName="bitcoin" />,
      },
    ],
    config: getNetworkConfigBTC(),
  },
  {
    chain: "BBN",
    connectors: [
      {
        id: "tomo-bbn-connector",
        widget: () => <ConnectButton chainName="cosmos" />,
      },
    ],
    config: getNetworkConfigBBN(),
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
    <TomoConnectionProvider>
      <WalletProvider config={config} context={context} onError={handleError}>
        <TomoBTCConnector />
        <TomoBBNConnector />
        {children}
      </WalletProvider>
    </TomoConnectionProvider>
  );
};
