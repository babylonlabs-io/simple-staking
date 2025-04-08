"use client";

import {
  IBBNProvider,
  useChainConnector,
  useWalletConnect,
} from "@babylonlabs-io/wallet-connector";
import { OfflineSigner } from "@cosmjs/proto-signing";
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
import { WalletError } from "@/app/context/Error/errors/walletError";
import { ChainType } from "@/app/types/network";
import { getNetworkConfigBBN } from "@/config/network/bbn";
import { createBbnAminoTypes } from "@/utils/wallet/amino";
import { createBbnRegistry } from "@/utils/wallet/bbnRegistry";

const { chainId, rpc } = getNetworkConfigBBN();

interface CosmosWalletContextProps {
  loading: boolean;
  bech32Address: string;
  connected: boolean;
  disconnect: () => void;
  open: () => void;
  signingStargateClient: SigningStargateClient | undefined;
  walletProviderName: string;
}

const CosmosWalletContext = createContext<CosmosWalletContextProps>({
  loading: true,
  bech32Address: "",
  connected: false,
  disconnect: () => {},
  open: () => {},
  signingStargateClient: undefined,
  walletProviderName: "",
});

export const CosmosWalletProvider = ({ children }: PropsWithChildren) => {
  const [loading, setLoading] = useState(true);
  const [BBNWalletProvider, setBBNWalletProvider] = useState<
    IBBNProvider | undefined
  >();
  const [cosmosBech32Address, setCosmosBech32Address] = useState("");
  const [signingStargateClient, setSigningStargateClient] = useState<
    SigningStargateClient | undefined
  >();
  const [walletProviderName, setWalletProviderName] = useState("");

  const { handleError } = useError();
  const { open = () => {} } = useWalletConnect();
  const bbnConnector = useChainConnector("BBN");

  const cosmosDisconnect = useCallback(() => {
    setBBNWalletProvider(undefined);
    setCosmosBech32Address("");
    setSigningStargateClient(undefined);
    setWalletProviderName("");
  }, []);

  const connectCosmos = useCallback(
    async (provider: IBBNProvider | null) => {
      if (!provider) return;
      setLoading(true);

      try {
        const offlineSigner = provider.getOfflineSignerAuto
          ? // use `auto` (if it is provided) for direct and amino support
            await provider.getOfflineSignerAuto()
          : // otherwise, use `getOfflineSigner` for direct signer
            await provider.getOfflineSigner();

        // @ts-ignore - chainId is missing in keplr types
        if (offlineSigner.chainId && offlineSigner.chainId !== chainId) return;

        const address = await provider.getAddress();
        const client = await SigningStargateClient.connectWithSigner(
          rpc,
          offlineSigner as OfflineSigner,
          {
            registry: createBbnRegistry(),
            aminoTypes: createBbnAminoTypes(),
          },
        );
        const providerName =
          (await provider.getWalletProviderName()) || "Unknown";
        setSigningStargateClient(client);
        setBBNWalletProvider(provider);
        setCosmosBech32Address(address);
        setWalletProviderName(providerName);
        setLoading(false);
      } catch (error: any) {
        let walletError;
        if (error instanceof WalletError) {
          walletError = error;
        } else {
          walletError = new WalletError({
            message: error.message,
            chainType: ChainType.BBN,
            walletProviderName,
          });
        }

        handleError({
          error: walletError,
          displayOptions: {
            retryAction: () => connectCosmos(provider),
          },
        });
      }
    },
    [handleError, cosmosBech32Address, walletProviderName],
  );

  // Listen for Babylon account changes
  useEffect(() => {
    if (!BBNWalletProvider || !BBNWalletProvider.off || !BBNWalletProvider.on)
      return;

    const cb = async () => {
      await BBNWalletProvider.connectWallet();
      connectCosmos(BBNWalletProvider);
    };

    BBNWalletProvider.on("accountChanged", cb);
    return () => {
      BBNWalletProvider.off("accountChanged", cb);
    };
  }, [BBNWalletProvider, connectCosmos]);

  const cosmosContextValue = useMemo(
    () => ({
      loading,
      bech32Address: cosmosBech32Address,
      connected: Boolean(BBNWalletProvider) && Boolean(signingStargateClient),
      walletProviderName,
      disconnect: cosmosDisconnect,
      open,
      signingStargateClient,
    }),
    [
      loading,
      cosmosBech32Address,
      BBNWalletProvider,
      walletProviderName,
      cosmosDisconnect,
      open,
      signingStargateClient,
    ],
  );

  useEffect(() => {
    if (!bbnConnector) return;

    setLoading(false);

    if (bbnConnector.connectedWallet) {
      connectCosmos(bbnConnector?.connectedWallet.provider);
    }

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
