"use client";
import {
  IBTCProvider,
  InscriptionIdentifier,
  Network,
  useChainConnector,
  useWalletConnect,
} from "@babylonlabs-io/wallet-connector";
import type { networks } from "bitcoinjs-lib";
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
import { Fees } from "@/app/types/fee";
import { getNetworkConfigBTC } from "@/config/network/btc";
import {
  getAddressBalance,
  getNetworkFees,
  getTipHeight,
  pushTx,
} from "@/utils/mempool_api";
import {
  getPublicKeyNoCoord,
  isSupportedAddressType,
  toNetwork,
} from "@/utils/wallet";
import { WalletError, WalletErrorType } from "@/utils/wallet/errors";

const btcConfig = getNetworkConfigBTC();

interface BTCWalletContextProps {
  loading: boolean;
  network?: networks.Network;
  publicKeyNoCoord: string;
  address: string;
  connected: boolean;
  disconnect: () => void;
  open: () => void;
  getAddress: () => Promise<string>;
  getPublicKeyHex: () => Promise<string>;
  signPsbt: (psbtHex: string) => Promise<string>;
  signPsbts: (psbtsHexes: string[]) => Promise<string[]>;
  getNetwork: () => Promise<Network>;
  signMessage: (message: string, type: "ecdsa") => Promise<string>;
  getBalance: (address: string) => Promise<number>;
  getNetworkFees: () => Promise<Fees>;
  pushTx: (txHex: string) => Promise<string>;
  getBTCTipHeight: () => Promise<number>;
  getInscriptions: () => Promise<InscriptionIdentifier[]>;
}

const BTCWalletContext = createContext<BTCWalletContextProps>({
  loading: true,
  network: undefined,
  connected: false,
  publicKeyNoCoord: "",
  address: "",
  disconnect: () => {},
  open: () => {},
  getAddress: async () => "",
  getPublicKeyHex: async () => "",
  signPsbt: async () => "",
  signPsbts: async () => [],
  getNetwork: async () => ({}) as Network,
  signMessage: async () => "",
  getBalance: async () => 0,
  getNetworkFees: async () => ({}) as Fees,
  pushTx: async () => "",
  getBTCTipHeight: async () => 0,
  getInscriptions: async () => [],
});

export const BTCWalletProvider = ({ children }: PropsWithChildren) => {
  const [loading, setLoading] = useState(true);
  const [btcWalletProvider, setBTCWalletProvider] = useState<IBTCProvider>();
  const [network, setNetwork] = useState<networks.Network>();
  const [publicKeyNoCoord, setPublicKeyNoCoord] = useState("");
  const [address, setAddress] = useState("");

  const { handleError } = useError();
  const btcConnector = useChainConnector("BTC");
  const { open = () => {}, connected } = useWalletConnect();

  const btcDisconnect = useCallback(() => {
    setBTCWalletProvider(undefined);
    setNetwork(undefined);
    setPublicKeyNoCoord("");
    setAddress("");
  }, []);

  const connectBTC = useCallback(
    async (walletProvider: IBTCProvider | null) => {
      if (!walletProvider) return;
      setLoading(true);

      const supportedNetworkMessage =
        "Only Native SegWit and Taproot addresses are supported. Please switch the address type in your wallet and try again.";

      try {
        const network = await walletProvider.getNetwork();
        if (network !== btcConfig.network) return;
        const address = await walletProvider.getAddress();
        const supported = isSupportedAddressType(address);
        if (!supported) {
          // wallet error
          throw new Error(supportedNetworkMessage);
        }

        const publicKeyNoCoord = getPublicKeyNoCoord(
          await walletProvider.getPublicKeyHex(),
        );

        setBTCWalletProvider(walletProvider);
        setNetwork(toNetwork(network));
        setAddress(address);
        setPublicKeyNoCoord(publicKeyNoCoord.toString("hex"));
        setLoading(false);
      } catch (error: any) {
        if (
          error instanceof WalletError &&
          error.getType() === WalletErrorType.ConnectionCancelled
        ) {
          return;
        }
        let errorMessage;
        switch (true) {
          case /Incorrect address prefix for (Testnet \/ Signet|Mainnet)/.test(
            error.message,
          ):
            errorMessage = supportedNetworkMessage;
            break;
          default:
            errorMessage = error.message;
            break;
        }
        handleError({
          // wallet error
          error: new Error(errorMessage),
          displayOptions: {
            retryAction: () => connectBTC(walletProvider),
          },
        });
      }
    },
    [handleError],
  );

  useEffect(() => {
    if (!btcConnector) return;
    setLoading(false);
    if (btcConnector.connectedWallet) {
      connectBTC(btcConnector?.connectedWallet.provider);
    }

    const unsubscribe = btcConnector?.on("connect", (wallet) => {
      if (wallet.provider) {
        connectBTC(wallet.provider);
      }
    });

    return unsubscribe;
  }, [btcConnector, connectBTC]);

  // Listen for BTC account changes
  useEffect(() => {
    if (!btcWalletProvider) return;

    const cb = async () => {
      await btcWalletProvider.connectWallet();
      connectBTC(btcWalletProvider);
    };

    btcWalletProvider.on("accountChanged", cb);

    return () => void btcWalletProvider.off("accountChanged", cb);
  }, [btcWalletProvider, connectBTC]);

  const btcWalletMethods = useMemo(
    () => ({
      getAddress: async () => btcWalletProvider?.getAddress() ?? "",
      getPublicKeyHex: async () => btcWalletProvider?.getPublicKeyHex() ?? "",
      signPsbt: async (psbtHex: string) =>
        btcWalletProvider?.signPsbt(psbtHex) ?? "",
      signPsbts: async (psbtsHexes: string[]) =>
        btcWalletProvider?.signPsbts(psbtsHexes) ?? [],
      getNetwork: async () =>
        btcWalletProvider?.getNetwork() ?? ({} as Network),
      signMessage: async (message: string, type: "ecdsa") =>
        btcWalletProvider?.signMessage(message, type) ?? "",
      getBalance: async (address: string) => getAddressBalance(address),
      getNetworkFees: async () => getNetworkFees(),
      pushTx: async (txHex: string) => pushTx(txHex),
      getBTCTipHeight: async () => getTipHeight(),
      getInscriptions: async (): Promise<InscriptionIdentifier[]> => {
        if (!btcWalletProvider?.getInscriptions) {
          throw new Error("`getInscriptions` method is not provided");
        }

        return btcWalletProvider.getInscriptions();
      },
    }),
    [btcWalletProvider],
  );

  const btcContextValue = useMemo(
    () => ({
      loading,
      network,
      publicKeyNoCoord,
      address,
      connected,
      open,
      disconnect: btcDisconnect,
      ...btcWalletMethods,
    }),
    [
      loading,
      connected,
      network,
      publicKeyNoCoord,
      address,
      open,
      btcDisconnect,
      btcWalletMethods,
    ],
  );

  return (
    <BTCWalletContext.Provider value={btcContextValue}>
      {children}
    </BTCWalletContext.Provider>
  );
};

export const useBTCWallet = () => useContext(BTCWalletContext);
