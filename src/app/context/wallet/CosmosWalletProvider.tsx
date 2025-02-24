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

import { useError } from "@/app/context/Error/ErrorContext";
import { ErrorState } from "@/app/types/errors";
import { getNetworkConfigBBN } from "@/config/network/bbn";
import { createBbnAminoTypes } from "@/utils/wallet/bbnAmino";
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

  const { showError, captureError } = useError();
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
        // Monitor onChange event
        // window.addEventListener("keplr_keystorechange", (a) => {
        //   console.log("Keplr key store has changed. Refetching account info...", a);
        //   // Refetch account or key information here
        // });
        const address = await provider.getAddress();
        // const offlineSigner = await provider.getOfflineSigner();
        // TODO remove
        const offlineSigner =
          await window.keplr.getOfflineSignerOnlyAmino("bbn-test-5");
        // await window.$onekey.cosmos.getOfflineSignerOnlyAmino("bbn-test-5");
        // const offlineSigner =
        //   await window.keplr.getOfflineSignerAuto("bbn-test-5");
        // const offlineSigner = await window.keplr.getOfflineSigner("bbn-test-5");
        const aminoTypes = createBbnAminoTypes();
        const client = await SigningStargateClient.connectWithSigner(
          rpc,
          offlineSigner,
          {
            registry: createBbnRegistry(),
            aminoTypes,
          },
        );
        const chainId = await client.getChainId(); // "bbn-test-5"
        console.log("chainId", chainId);

        const { accountNumber, sequence } = await client.getSequence(address);
        console.log("accountNumber", accountNumber);
        console.log("sequence", sequence);

        // explicit signer data
        const signerData = {
          accountNumber: accountNumber,
          sequence: sequence,
          chainId: chainId,
        };
        console.log("signerData", signerData);

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
    [captureError, showError, rpc],
  );

  // Listen for BABY account changes
  useEffect(() => {
    if (!BBNWalletProvider) return;

    const cb = async () => {
      await BBNWalletProvider.connectWallet();
      connectCosmos(BBNWalletProvider);
    };

    window.addEventListener("keplr_keystorechange", cb);

    return () => window.removeEventListener("keplr_keystorechange", cb);
  }, [BBNWalletProvider, connectCosmos]);

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
