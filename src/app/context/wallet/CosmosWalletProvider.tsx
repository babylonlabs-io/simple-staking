import { SigningStargateClient } from "@cosmjs/stargate";
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
  getSigningStargateClient(): Promise<SigningStargateClient>;
}

const getSigningStargateClientDefault = async () => {
  throw new Error("Not initialized");
};

const CosmosWalletContext = createContext<CosmosWalletContextProps>({
  bech32Address: "",
  connected: false,
  disconnect: () => {},
  open: () => {},
  getSigningStargateClient: getSigningStargateClientDefault,
});

export const CosmosWalletProvider = ({ children }: PropsWithChildren) => {
  const [cosmosWalletProvider, setCosmosWalletProvider] = useState<any>();
  const [cosmosBech32Address, setCosmosBech32Address] = useState("");

  const { showError, captureError } = useError();
  const { open, isConnected, providers } = useWalletConnection();

  const cosmosDisconnect = useCallback(() => {
    setCosmosWalletProvider(undefined);
    setCosmosBech32Address("");
  }, []);

  const connectCosmos = useCallback(async () => {
    if (!providers.cosmosProvider) return;

    try {
      await providers.cosmosProvider.connectWallet();
      const address = await providers.cosmosProvider.getAddress();
      const registry = getBbnRegistry();
      await providers.cosmosProvider.getSigningStargateClient({ registry });

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
  }, [providers.cosmosProvider, showError]);

  const cosmosContextValue = useMemo(
    () => ({
      bech32Address: cosmosBech32Address,
      connected: Boolean(cosmosWalletProvider),
      disconnect: cosmosDisconnect,
      open,
      getSigningStargateClient: cosmosWalletProvider?.getSigningStargateClient,
    }),
    [cosmosBech32Address, cosmosWalletProvider, cosmosDisconnect, open],
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
