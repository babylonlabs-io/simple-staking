import {
  BBNProvider,
  useChainConnector,
  useWalletConnect,
} from "@babylonlabs-io/bbn-wallet-connect";
import { SigningStargateClient } from "@cosmjs/stargate";
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

import { bbnDefaultContext } from "../constants";
import { CosmosWalletContext as CosmosWalletContextProps } from "../types";

export const CosmosWalletContext =
  createContext<CosmosWalletContextProps>(bbnDefaultContext);

export const BBNWalletProvider = ({ children }: PropsWithChildren) => {
  const [BBNWalletProvider, setBBNWalletProvider] =
    useState<BBNProvider | null>(null);
  const [cosmosBech32Address, setCosmosBech32Address] = useState("");
  const [signingStargateClient, setSigningStargateClient] =
    useState<SigningStargateClient | null>(null);

  const { showError, captureError } = useError();
  const { open = () => {}, connected } = useWalletConnect();
  const bbnConnector = useChainConnector("BBN");

  const cosmosDisconnect = useCallback(() => {
    setBBNWalletProvider(null);
    setCosmosBech32Address("");
    setSigningStargateClient(null);
  }, []);

  const connectCosmos = useCallback(
    async (provider: BBNProvider | null) => {
      if (!provider) return;

      try {
        const address = await provider.getAddress();
        const client = await provider.getSigningStargateClient();
        setSigningStargateClient(client);
        setBBNWalletProvider(provider);
        setCosmosBech32Address(address);
      } catch (error: any) {
        showError({
          error: {
            message: error.message,
            errorState: ErrorState.WALLET,
          },
          retryAction: () => connectCosmos(provider),
        });
        captureError(error);
      }
    },
    [captureError, showError],
  );

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
    const unsubscribe = bbnConnector?.on("connect", (wallet) => {
      connectCosmos(wallet.provider);
    });

    return unsubscribe;
  }, [bbnConnector, connectCosmos]);

  return (
    <CosmosWalletContext.Provider value={cosmosContextValue}>
      {children}
    </CosmosWalletContext.Provider>
  );
};
