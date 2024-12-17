import {
  createExternalWallet,
  IBTCProvider,
  useChainConnector,
  useWidgetState,
} from "@babylonlabs-io/bbn-wallet-connect";
import {
  BTCProvider,
  useTomoProviders,
  useTomoWalletConnect,
  useTomoWalletState,
  useWalletList,
} from "@tomo-inc/wallet-connect-sdk";
import { memo, useCallback, useEffect, useMemo } from "react";

const createProvider = (provider: BTCProvider): IBTCProvider => {
  return {
    connectWallet: async () => void provider.connectWallet(),
    getAddress: () => provider.getAddress(),
    getPublicKeyHex: () => provider.getPublicKeyHex(),
    signPsbt: (psbtHex: string) => provider.signPsbt(psbtHex),
    signPsbts: (psbtsHexes: string[]) => provider.signPsbts(psbtsHexes),
    getNetwork: () => provider.getNetwork(),
    signMessage: (message: string, type: "ecdsa") =>
      provider.signMessage(message, type),
    on: (eventName: string, callBack: () => void) =>
      provider.on(eventName, callBack),
    off: (eventName: string, callBack: () => void) =>
      provider.off(eventName, callBack),
    getWalletProviderName: () => provider.getWalletProviderName(),
    getWalletProviderIcon: () => provider.getWalletProviderIcon(),
    getInscriptions: () =>
      provider
        .getInscriptions()
        .then((result) =>
          result.list.map((ordinal) => ({
            txid: ordinal.inscriptionId,
            vout: ordinal.outputValue,
          })),
        )
        .catch(() => []),
  };
};

export const TomoBTCConnector = memo(() => {
  const tomoWalletState = useTomoWalletState();
  const walletList = useWalletList();
  const { bitcoinProvider: connectedProvider } = useTomoProviders();
  const tomoWalletConnect = useTomoWalletConnect();

  const { visible } = useWidgetState();
  const connector = useChainConnector("BTC");

  const connectedWallet = useMemo(() => {
    const { connected, walletId } = tomoWalletState.bitcoin ?? {};

    return connected && walletId
      ? (walletList.find((wallet: any) => wallet.id === walletId) ?? null)
      : null;
  }, [tomoWalletState.bitcoin, walletList]);

  const connect = useCallback(
    async (btcWallet: any, btcProvider: BTCProvider) => {
      if (!connector) return;

      const wallet = createExternalWallet({
        id: "tomo-btc-connector",
        name: btcWallet.name,
        icon: btcWallet.img,
        provider: createProvider(btcProvider),
      });

      await connector.connect(wallet);
    },
    [connector],
  );

  useEffect(() => {
    if (visible && connectedWallet && connectedProvider) {
      connect(connectedWallet, connectedProvider);
    }
  }, [visible, connectedWallet, connectedProvider, connect]);

  useEffect(() => {
    if (!connector) return;

    const unsubscribe = connector.on("disconnect", (wallet) => {
      if (wallet.id === "tomo-btc-connector") {
        tomoWalletConnect.disconnect();
      }
    });

    return unsubscribe;
  }, [connector, tomoWalletConnect]);

  return null;
});

TomoBTCConnector.displayName = "TomoBTCConnector";
