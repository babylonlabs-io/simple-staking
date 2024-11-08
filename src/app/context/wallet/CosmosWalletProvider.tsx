import { SigningStargateClient } from "@cosmjs/stargate";
import { CosmosProvider } from "@tomo-inc/wallet-connect-sdk";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from "react";

import { useError } from "@/app/context/Error/ErrorContext";
import { ErrorState } from "@/app/types/errors";
import { getBbnRegistry } from "@/utils/wallet/bbnRegistry";

import { useWalletConnection } from "./WalletConnectionProvider";

interface CosmosWalletContextProps {
  bech32Address: string;
  connected: boolean;
  disconnect: () => void;
  open: () => void;
  signingStargateClient: SigningStargateClient | undefined;
}

const CosmosWalletContext = createContext<CosmosWalletContextProps>({
  bech32Address: "",
  connected: false,
  disconnect: () => {},
  open: () => {},
  signingStargateClient: undefined,
});

export const CosmosWalletProvider = ({ children }: PropsWithChildren) => {
  const [cosmosWalletProvider, setCosmosWalletProvider] = useState<
    CosmosProvider | undefined
  >();
  const [cosmosBech32Address, setCosmosBech32Address] = useState("");
  const [signingStargateClient, setSigningStargateClient] = useState<
    SigningStargateClient | undefined
  >();
  const { showError, captureError } = useError();
  const { open, isConnected, providers } = useWalletConnection();

  const cosmosDisconnect = useCallback(() => {
    setCosmosWalletProvider(undefined);
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
      setCosmosWalletProvider(providers.cosmosProvider);
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
      connected:
        Boolean(cosmosWalletProvider) && Boolean(signingStargateClient),
      disconnect: cosmosDisconnect,
      open,
      signingStargateClient,
    }),
    [
      cosmosBech32Address,
      cosmosWalletProvider,
      cosmosDisconnect,
      open,
      signingStargateClient,
    ],
  );

  useEffect(() => {
    if (isConnected && providers.state) {
      if (!cosmosWalletProvider && providers.cosmosProvider) {
        connectCosmos();
      }
    }
  }, [
    connectCosmos,
    providers.cosmosProvider,
    providers.state,
    isConnected,
    cosmosWalletProvider,
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

export const useCosmosWallet = () => useContext(CosmosWalletContext);
