"use client";

import {
  ChainConfigArr,
  ExternalWallets,
  WalletProvider,
} from "@babylonlabs-io/wallet-connector";
import { useTheme } from "next-themes";
import { useCallback, type PropsWithChildren } from "react";

import { logTermsAcceptance } from "@/app/api/logTermAcceptance";
import { verifyBTCAddress } from "@/app/api/verifyBTCAddress";
import { getNetworkConfigBBN } from "@/config/network/bbn";
import { getNetworkConfigBTC } from "@/config/network/btc";

import { useError } from "../Error/ErrorProvider";
import { WalletError } from "../Error/errors/walletError";

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
        widget: ({ onError }) => (
          <ExternalWallets chainName="bitcoin" onError={onError} />
        ),
      },
    ],
    config: getNetworkConfigBTC(),
  },
  {
    chain: "BBN",
    connectors: [
      {
        id: "tomo-bbn-connector",
        widget: ({ onError }) => (
          <ExternalWallets chainName="cosmos" onError={onError} />
        ),
      },
    ],
    config: getNetworkConfigBBN(),
  },
] as const;

export const WalletConnectionProvider = ({ children }: PropsWithChildren) => {
  const { handleError } = useError();
  const { theme } = useTheme();

  const onError = useCallback(
    (error: Error) => {
      if (error instanceof WalletError) {
        handleError({ error });
      } else {
        const walletError = new WalletError({
          message: error.message,
        });
        handleError({ error: walletError });
      }
    },
    [handleError],
  );

  return (
    <WalletProvider
      persistent
      theme={theme}
      lifecycleHooks={lifecycleHooks}
      config={config}
      context={context}
      onError={onError}
    >
      {children}
    </WalletProvider>
  );
};
