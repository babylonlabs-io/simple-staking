"use client";

import {
  ChainConfigArr,
  WalletProvider,
} from "@babylonlabs-io/wallet-connector";
import { type PropsWithChildren } from "react";

import { logTermsAcceptance } from "@/app/api/logTermAcceptance";
import { verifyBTCAddress } from "@/app/api/verifyBTCAddress";
import { TomoConnectionProvider } from "@/app/context/tomo/TomoProvider";
import { TomoWidget } from "@/app/context/tomo/TomoWidget";
import { ErrorType } from "@/app/types/errors";
import { getNetworkConfigBBN } from "@/config/network/bbn";
import { getNetworkConfigBTC } from "@/config/network/btc";

import { useError } from "../Error/ErrorProvider";
import { TomoBBNConnector } from "../tomo/BBNConnector";
import { TomoBTCConnector } from "../tomo/BTCConnector";

const context = typeof window !== "undefined" ? window : {};

const lifecycleHooks = {
  acceptTermsOfService: logTermsAcceptance,
  verifyBTCAddress: verifyBTCAddress,
};

const config: ChainConfigArr = [
  {
    chain: "BTC",
    connectors: [
      {
        id: "tomo-btc-connector",
        widget: () => <TomoWidget chainName="bitcoin" />,
      },
    ],
    config: getNetworkConfigBTC(),
  },
  {
    chain: "BBN",
    connectors: [
      {
        id: "tomo-bbn-connector",
        widget: () => <TomoWidget chainName="cosmos" />,
      },
    ],
    config: getNetworkConfigBBN(),
  },
] as const;

export const WalletConnectionProvider = ({ children }: PropsWithChildren) => {
  const { handleError } = useError();

  const onError = (error: Error) => {
    if (error.message === "Keplr override") {
      handleError({
        error: {
          message:
            "Please disable other Cosmos extensions as they may interfere with Keplr.",
          type: ErrorType.WALLET,
        },
      });
    } else {
      handleError({
        error,
      });
    }
  };

  return (
    <TomoConnectionProvider>
      <WalletProvider
        lifecycleHooks={lifecycleHooks}
        config={config}
        context={context}
        onError={onError}
      >
        <TomoBTCConnector />
        <TomoBBNConnector />
        {children}
      </WalletProvider>
    </TomoConnectionProvider>
  );
};
