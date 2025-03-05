import {
  createExternalWallet,
  IBBNProvider,
  useChainConnector,
} from "@babylonlabs-io/wallet-connector";
import {
  CosmosProvider,
  useTomoProviders,
  useTomoWalletConnect,
  useTomoWalletState,
  useWalletList,
} from "@tomo-inc/wallet-connect-sdk";
import { memo, useCallback, useEffect, useMemo } from "react";

const createProvider = (provider: CosmosProvider): IBBNProvider => {
  return {
    connectWallet: async () => void (await provider.connectWallet()),
    getAddress: () => provider.getAddress(),
    getPublicKeyHex: () => provider.getPublicKeyHex(),
    getWalletProviderName: () => provider.getWalletProviderName(),
    getWalletProviderIcon: () => provider.getWalletProviderIcon(),
    getOfflineSigner: () => provider.getOfflineSigner(),
    // not yet implemented
    // provider.on(eventName, callBack)
    on: () => {},
    off: () => {},
  };
};

export const TomoBBNConnector = memo(() => {
  const tomoWalletState = useTomoWalletState();
  const walletList = useWalletList();
  const { cosmosProvider: connectedProvider } = useTomoProviders();
  const tomoWalletConnect = useTomoWalletConnect();

  const connector = useChainConnector("BBN");

  const connectedWallet = useMemo(() => {
    const { connected, walletId } = tomoWalletState.cosmos ?? {};

    return connected && walletId
      ? (walletList.find((wallet: any) => wallet.id === walletId) ?? null)
      : null;
  }, [tomoWalletState.cosmos, walletList]);

  const connect = useCallback(
    async (bbnWallet: any, bbnProvider: CosmosProvider) => {
      if (!connector) return;

      const wallet = createExternalWallet({
        id: "tomo-bbn-connector",
        name: bbnWallet.name,
        icon: bbnWallet.img,
        provider: createProvider(bbnProvider),
      });

      await connector.connect(wallet);
    },
    [connector],
  );

  useEffect(() => {
    if (connectedWallet && connectedProvider) {
      connect(connectedWallet, connectedProvider);
    }
  }, [connectedWallet, connectedProvider, connect]);

  useEffect(() => {
    if (!connector) return;

    const unsubscribe = connector.on("disconnect", (wallet) => {
      if (wallet.id === "tomo-bbn-connector") {
        tomoWalletConnect.disconnect();
      }
    });

    return unsubscribe;
  }, [connector, tomoWalletConnect]);

  return null;
});

TomoBBNConnector.displayName = "TomoBBNConnector";
