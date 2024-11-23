import { SigningStargateClient } from "@cosmjs/stargate";
import { CosmosProvider } from "@tomo-inc/wallet-connect-sdk";
import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from "react";

import { useError } from "@/app/context/Error/ErrorContext";
import { ErrorState } from "@/app/types/errors";
import { getBbnRegistry } from "@/utils/wallet/bbnRegistry";

import { bbnDefaultContext } from "../constants";
import { CosmosWalletContext as CosmosWalletContextProps } from "../types";

import { useWalletConnection } from "./Provider";

export const CosmosWalletContext =
  createContext<CosmosWalletContextProps>(bbnDefaultContext);

export const BBNWalletProvider = ({ children }: PropsWithChildren) => {
  const [BBNWalletProvider, setBBNWalletProvider] = useState<
    CosmosProvider | undefined
  >();
  const [cosmosBech32Address, setCosmosBech32Address] = useState("");
  const [signingStargateClient, setSigningStargateClient] = useState<
    SigningStargateClient | undefined
  >();
  const { showError, captureError } = useError();
  const { open, isConnected, providers } = useWalletConnection();

  const cosmosDisconnect = useCallback(() => {
    setBBNWalletProvider(undefined);
    setCosmosBech32Address("");
    setSigningStargateClient(undefined);
  }, []);

  const connectCosmos = useCallback(async () => {
    if (!providers.cosmosProvider) return;

    try {
      await providers.cosmosProvider.connectWallet();
      const address = await providers.cosmosProvider.getAddress();
      const client = await providers.cosmosProvider.getSigningStargateClient({
        registry: getBbnRegistry(),
      });
      setSigningStargateClient(client);
      setBBNWalletProvider(providers.cosmosProvider);
      setCosmosBech32Address(address);
    } catch (error: any) {
      showError({
        error: {
          message: error.message,
          errorState: ErrorState.WALLET,
        },
        retryAction: connectCosmos,
      });
      captureError(error);
    }
  }, [captureError, providers.cosmosProvider, showError]);

  const cosmosContextValue = useMemo(
    () => ({
      bech32Address: cosmosBech32Address,
      connected: Boolean(BBNWalletProvider) && Boolean(signingStargateClient),
      disconnect: cosmosDisconnect,
      open,
      signingStargateClient,
    }),
    [
      cosmosBech32Address,
      BBNWalletProvider,
      cosmosDisconnect,
      open,
      signingStargateClient,
    ],
  );

  useEffect(() => {
    if (isConnected && providers.state) {
      if (!BBNWalletProvider && providers.cosmosProvider) {
        connectCosmos();
      }
    }
  }, [
    connectCosmos,
    providers.cosmosProvider,
    providers.state,
    isConnected,
    BBNWalletProvider,
  ]);

  // Clean up the state when isConnected becomes false
  useEffect(() => {
    if (!isConnected) {
      cosmosDisconnect();
    }
  }, [isConnected, cosmosDisconnect]);

  return (
    <CosmosWalletContext.Provider value={cosmosContextValue}>
      {children}
    </CosmosWalletContext.Provider>
  );
};
