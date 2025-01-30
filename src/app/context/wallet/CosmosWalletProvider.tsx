"use client";

import {
  IBBNProvider,
  useChainConnector,
  useWalletConnect,
} from "@babylonlabs-io/bbn-wallet-connect";
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

import { useError } from "@/app/context/Error/ErrorProvider";
import { getNetworkConfigBBN } from "@/config/network/bbn";
import { createBbnRegistry } from "@/utils/wallet/bbnRegistry";

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
  const [BBNWalletProvider, setBBNWalletProvider] = useState<
    IBBNProvider | undefined
  >();
  const [cosmosBech32Address, setCosmosBech32Address] = useState("");
  const [signingStargateClient, setSigningStargateClient] = useState<
    SigningStargateClient | undefined
  >();

  const { handleError } = useError();
  const { open = () => {} } = useWalletConnect();
  const bbnConnector = useChainConnector("BBN");
  const { rpc } = getNetworkConfigBBN();

  const cosmosDisconnect = useCallback(() => {
    setBBNWalletProvider(undefined);
    setCosmosBech32Address("");
    setSigningStargateClient(undefined);
  }, []);

  const connectCosmos = useCallback(
    async (provider: IBBNProvider | null) => {
      if (!provider) return;

      try {
        const address = await provider.getAddress();
        const offlineSigner = await provider.getOfflineSigner();
        const client = await SigningStargateClient.connectWithSigner(
          rpc,
          offlineSigner,
          {
            registry: createBbnRegistry(),
          },
        );
        setSigningStargateClient(client);
        setBBNWalletProvider(provider);
        setCosmosBech32Address(address);
      } catch (error: any) {
        handleError({
          error,
          displayOptions: {
            retryAction: () => connectCosmos(provider),
          },
        });
      }
    },
    [handleError, rpc],
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
export const useCosmosWallet = () => useContext(CosmosWalletContext);
