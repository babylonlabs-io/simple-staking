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

import { getNetworkConfigBBN } from "@/ui/common/config/network/bbn";
import { useError } from "@/ui/common/context/Error/ErrorProvider";
import { ClientError, ERROR_CODES } from "@/ui/common/errors";
import { useLogger } from "@/ui/common/hooks/useLogger";
import { useSentryUser } from "@/ui/common/hooks/useSentryUser";
import { createBbnAminoTypes } from "@/ui/common/utils/wallet/amino";
import { createBbnRegistry } from "@/ui/common/utils/wallet/bbnRegistry";

const { chainId, rpc } = getNetworkConfigBBN();

interface CosmosWalletContextProps {
  loading: boolean;
  bech32Address: string;
  connected: boolean;
  disconnect: () => void;
  open: () => void;
  signingStargateClient: SigningStargateClient | undefined;
  walletName: string;
}

const CosmosWalletContext = createContext<CosmosWalletContextProps>({
  loading: true,
  bech32Address: "",
  connected: false,
  disconnect: () => {},
  open: () => {},
  signingStargateClient: undefined,
  walletName: "",
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
  const [walletName, setWalletName] = useState("");

  const { handleError } = useError();
  const logger = useLogger();
  const { open = () => {} } = useWalletConnect();
  const bbnConnector = useChainConnector("BBN");
  const { updateUser } = useSentryUser();

  const cosmosDisconnect = useCallback(() => {
    setBBNWalletProvider(undefined);
    setCosmosBech32Address("");
    setSigningStargateClient(undefined);

    updateUser({ babylonAddress: null });
  }, [updateUser]);

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

        // @ts-expect-error - chainId is missing in keplr types
        if (offlineSigner.chainId && offlineSigner.chainId !== chainId) {
          const networkMismatchError = new ClientError(
            ERROR_CODES.WALLET_CONFIGURATION_ERROR,
            `Cosmos wallet chain ID does not match configured chain ID (${chainId}).`,
          );
          throw networkMismatchError;
        }

        const bech32Address = await provider.getAddress();
        if (!bech32Address) {
          const noAddressError = new ClientError(
            ERROR_CODES.WALLET_CONFIGURATION_ERROR,
            "Cosmos wallet provider returned an empty address.",
          );
          throw noAddressError;
        }

        const walletNameStr = await provider.getWalletProviderName();
        if (!walletNameStr) {
          const noWalletNameError = new ClientError(
            ERROR_CODES.WALLET_CONFIGURATION_ERROR,
            "Cosmos wallet provider returned an empty wallet name.",
          );
          throw noWalletNameError;
        }

        const client = await SigningStargateClient.connectWithSigner(
          rpc,
          offlineSigner as OfflineSigner,
          {
            registry: createBbnRegistry(),
            aminoTypes: createBbnAminoTypes(),
          },
        );
        setSigningStargateClient(client);
        setBBNWalletProvider(provider);
        setCosmosBech32Address(bech32Address);
        setLoading(false);
        setWalletName(walletNameStr || "Unknown Wallet");

        updateUser({ babylonAddress: bech32Address });

        logger.info("Babylon wallet connected", {
          babylonAddress: bech32Address,
          walletName: walletNameStr || "Unknown Wallet",
          chainId,
        });
      } catch (error: any) {
        logger.error(error);
        handleError({
          error,
          displayOptions: {
            retryAction: () => connectCosmos(provider),
          },
          metadata: {
            babylonAddress: cosmosBech32Address,
            walletName,
          },
        });
      }
    },
    [handleError, cosmosBech32Address, walletName, logger, updateUser],
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
      disconnect: cosmosDisconnect,
      open,
      signingStargateClient,
      walletName,
    }),
    [
      loading,
      cosmosBech32Address,
      BBNWalletProvider,
      cosmosDisconnect,
      open,
      signingStargateClient,
      walletName,
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

  useEffect(() => {
    if (!bbnConnector) return;

    const unsubscribe = bbnConnector.on("disconnect", () => {
      cosmosDisconnect();
    });

    return unsubscribe;
  }, [bbnConnector, cosmosDisconnect]);

  useEffect(() => {
    if (!bbnConnector) return;

    const installedWallets = bbnConnector.wallets
      .filter((wallet) => wallet.installed)
      .reduce(
        (acc, wallet) => ({ ...acc, [wallet.id]: wallet.name }),
        {} as Record<string, string>,
      );

    logger.info("Installed Babylon wallets", {
      installedWallets: Object.values(installedWallets).join(", ") || "",
    });
  }, [bbnConnector, logger]);

  return (
    <CosmosWalletContext.Provider value={cosmosContextValue}>
      {children}
    </CosmosWalletContext.Provider>
  );
};
export const useCosmosWallet = () => useContext(CosmosWalletContext);
