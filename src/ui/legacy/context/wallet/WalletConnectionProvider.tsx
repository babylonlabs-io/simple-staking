import {
  ChainConfigArr,
  ExternalWallets,
  WalletProvider,
} from "@babylonlabs-io/wallet-connector";
import { useTheme } from "next-themes";
import { useCallback, type PropsWithChildren } from "react";

import { logTermsAcceptance } from "@/ui/legacy/api/logTermAcceptance";
import { verifyBTCAddress } from "@/ui/legacy/api/verifyBTCAddress";
import { getNetworkConfigBBN } from "@/ui/legacy/config/network/bbn";
import { getNetworkConfigBTC } from "@/ui/legacy/config/network/btc";
import { ClientError, ERROR_CODES } from "@/ui/legacy/errors";
import { useLogger } from "@/ui/legacy/hooks/useLogger";
import FeatureFlagService from "@/ui/legacy/utils/FeatureFlagService";

import { useError } from "../Error/ErrorProvider";

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
];

export const WalletConnectionProvider = ({ children }: PropsWithChildren) => {
  const { handleError } = useError();
  const { theme } = useTheme();
  const logger = useLogger();

  const onError = useCallback(
    (error: Error) => {
      if (error?.message?.includes("rejected")) {
        return;
      }

      const clientError = new ClientError(
        ERROR_CODES.WALLET_ACTION_FAILED,
        "Error connecting to wallet",
        { cause: error as Error },
      );
      logger.error(clientError);
      handleError({
        error: clientError,
      });
    },
    [handleError, logger],
  );

  return (
    <WalletProvider
      persistent
      theme={theme}
      lifecycleHooks={lifecycleHooks}
      config={config}
      context={context}
      onError={onError}
      disabledWallets={FeatureFlagService.IsLedgerEnabled ? [] : ["ledget_btc"]}
    >
      {children}
    </WalletProvider>
  );
};
