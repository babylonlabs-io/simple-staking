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

import { useWalletConnection } from "./WalletConnectionProvider";

interface CosmosWalletContextProps {
  bech32Address: string;
  pubKey: string;
  connected: boolean;
  disconnect: () => void;
  open: () => void;
  signArbitrary: (message: string) => Promise<any>;
}

const CosmosWalletContext = createContext<CosmosWalletContextProps>({
  bech32Address: "",
  pubKey: "",
  connected: false,
  disconnect: () => {},
  open: () => {},
  signArbitrary: async () => {},
});

export const CosmosWalletProvider = ({ children }: PropsWithChildren) => {
  const [cosmosWalletProvider, setCosmosWalletProvider] = useState<any>();
  const [cosmosBech32Address, setCosmosBech32Address] = useState("");
  const [cosmosPubKey, setCosmosPubKey] = useState("");
  const [cosmosChainID, setCosmosChainID] = useState("");

  const { showError } = useError();
  const { open, isConnected, providers } = useWalletConnection();

  const cosmosDisconnect = useCallback(() => {
    setCosmosWalletProvider(undefined);
    setCosmosBech32Address("");
    setCosmosPubKey("");
    setCosmosChainID("");
  }, []);

  const connectCosmos = useCallback(async () => {
    if (!providers.cosmosProvider) return;

    try {
      const chainID = providers.cosmosProvider.getChainId();
      const cosmosInfo =
        await providers.cosmosProvider.provider.getKey(chainID);

      const { bech32Address, pubKey } = cosmosInfo;
      setCosmosWalletProvider(providers.cosmosProvider);
      setCosmosBech32Address(bech32Address);
      setCosmosPubKey(Buffer.from(pubKey).toString("hex"));
      setCosmosChainID(chainID);
    } catch (error: any) {
      showError({
        error: {
          message: error.message,
          errorState: ErrorState.WALLET,
        },
        retryAction: connectCosmos,
      });
    }
  }, [providers.cosmosProvider, showError]);

  const cosmosContextValue = useMemo(
    () => ({
      bech32Address: cosmosBech32Address,
      pubKey: cosmosPubKey,
      connected: Boolean(cosmosWalletProvider),
      disconnect: cosmosDisconnect,
      open,
      signArbitrary: (message: string) =>
        cosmosWalletProvider.provider.signArbitrary(
          cosmosChainID,
          cosmosBech32Address,
          message,
        ),
    }),
    [
      cosmosChainID,
      cosmosBech32Address,
      cosmosPubKey,
      cosmosWalletProvider,
      cosmosDisconnect,
      open,
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
