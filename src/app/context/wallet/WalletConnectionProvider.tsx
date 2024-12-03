"use client";

import {
  ChainConfigArr,
  Network,
  WalletProvider,
} from "@babylonlabs-io/bbn-wallet-connect";
import { type PropsWithChildren } from "react";

import { ConnectButton } from "@/app/context/tomo/ConnectButton";
import { TomoConnectionProvider } from "@/app/context/tomo/TomoProvider";
import { ErrorState } from "@/app/types/errors";
import { bbnDevnet } from "@/config/wallet/babylon";

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
    connectors: [
      {
        id: "tomo-bbn-connector",
        widget: () => <ConnectButton chainName="cosmos" />,
      },
    ],
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
    <TomoConnectionProvider>
      <WalletProvider config={config} context={context} onError={handleError}>
        <TomoBTCConnector />
        <TomoBBNConnector />
        {children}
      </WalletProvider>
    </TomoConnectionProvider>
  );
};
