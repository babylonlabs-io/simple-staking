"use client";
import {
  IBTCProvider,
  InscriptionIdentifier,
  Network,
  useChainConnector,
  useWalletConnect,
} from "@babylonlabs-io/wallet-connector";
import { setUser } from "@sentry/nextjs";
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
import { ClientError, ERROR_CODES } from "@/errors";
import { useLogger } from "@/hooks/useLogger";
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
  signMessage: (
    message: string,
    type: "ecdsa" | "bip322-simple",
  ) => Promise<string>;
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
  const logger = useLogger();

  const btcDisconnect = useCallback(() => {
    setBTCWalletProvider(undefined);
    setNetwork(undefined);
    setPublicKeyNoCoord("");
    setAddress("");

    setUser({
      btcAddress: null,
    });
  }, []);

  const connectBTC = useCallback(
    async (walletProvider: IBTCProvider | null) => {
      if (!walletProvider) return;
      setLoading(true);

      const supportedNetworkMessage =
        "Only Native SegWit and Taproot addresses are supported. Please switch the address type in your wallet and try again.";

      try {
        const network = await walletProvider.getNetwork();
        if (network !== btcConfig.network) {
          const networkMismatchError = new ClientError(
            ERROR_CODES.WALLET_CONFIGURATION_ERROR,
            `BTC wallet network (${network}) does not match configured network (${btcConfig.network}).`,
          );
          logger.error(networkMismatchError, {
            tags: { errorCode: networkMismatchError.errorCode },
          });
          throw networkMismatchError;
        }

        const address = await walletProvider.getAddress();
        if (!address) {
          const noAddressError = new ClientError(
            ERROR_CODES.WALLET_CONFIGURATION_ERROR,
            "BTC wallet provider returned an empty address.",
          );
          logger.error(noAddressError, {
            tags: { errorCode: noAddressError.errorCode },
          });
          throw noAddressError;
        }

        const supported = isSupportedAddressType(address);
        if (!supported) {
          const clientError = new ClientError(
            ERROR_CODES.WALLET_CONFIGURATION_ERROR,
            supportedNetworkMessage,
          );
          logger.warn(clientError.message, {
            errorCode: clientError.errorCode,
          });
          throw clientError;
        }

        const publicKeyHex = await walletProvider.getPublicKeyHex();
        if (!publicKeyHex) {
          const noPubKeyError = new ClientError(
            ERROR_CODES.WALLET_CONFIGURATION_ERROR,
            "BTC wallet provider returned an empty public key.",
          );
          logger.error(noPubKeyError, {
            tags: { errorCode: noPubKeyError.errorCode },
          });
          throw noPubKeyError;
        }

        const publicKeyBuffer = getPublicKeyNoCoord(publicKeyHex);
        const publicKeyNoCoordHex = publicKeyBuffer.toString("hex");

        if (!publicKeyNoCoordHex) {
          const emptyProcessedPubKeyError = new ClientError(
            ERROR_CODES.WALLET_CONFIGURATION_ERROR,
            "Processed BTC public key (no coordinates) is empty.",
          );
          logger.error(emptyProcessedPubKeyError, {
            tags: { errorCode: emptyProcessedPubKeyError.errorCode },
          });
          throw emptyProcessedPubKeyError;
        }

        setBTCWalletProvider(walletProvider);
        setNetwork(toNetwork(network));
        setAddress(address);
        setPublicKeyNoCoord(publicKeyNoCoordHex);
        setLoading(false);

        setUser({
          btcAddress: address,
        });

        logger.info("BTC wallet connected", {
          network,
          userPublicKey: publicKeyNoCoordHex,
          btcAddress: address,
          walletName: await walletProvider.getWalletProviderName(),
        });
      } catch (error: any) {
        const clientError = new ClientError(
          ERROR_CODES.WALLET_ACTION_FAILED,
          error.message,
          { cause: error as Error },
        );
        logger.error(clientError, {
          tags: {
            errorCode: clientError.errorCode,
          },
        });
        handleError({
          error: clientError,
          displayOptions: {
            retryAction: () => connectBTC(walletProvider),
          },
          metadata: {
            userPublicKey: publicKeyNoCoord,
            btcAddress: address,
          },
        });
      }
    },
    [handleError, publicKeyNoCoord, address, logger],
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

  useEffect(() => {
    if (!btcConnector) return;

    const installedWallets = btcConnector.wallets
      .filter((wallet) => wallet.installed)
      .reduce(
        (acc, wallet) => ({ ...acc, [wallet.id]: wallet.name }),
        {} as Record<string, string>,
      );

    logger.info("Installed BTC wallets", {
      installedWallets: Object.values(installedWallets).join(", "),
    });
  }, [btcConnector, logger]);

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
      signMessage: async (message: string, type: "ecdsa" | "bip322-simple") =>
        btcWalletProvider?.signMessage(message, type) ?? "",
      getBalance: async (address: string) => getAddressBalance(address),
      getNetworkFees: async () => getNetworkFees(),
      pushTx: async (txHex: string) => pushTx(txHex),
      getBTCTipHeight: async () => getTipHeight(),
      getInscriptions: async (): Promise<InscriptionIdentifier[]> => {
        if (!btcWalletProvider?.getInscriptions) {
          const clientError = new ClientError(
            ERROR_CODES.WALLET_CONFIGURATION_ERROR,
            "`getInscriptions` method is not provided by the wallet",
          );
          logger.warn(clientError.message, {
            errorCode: clientError.errorCode,
          });
          throw clientError;
        }

        return btcWalletProvider.getInscriptions();
      },
    }),
    [btcWalletProvider, logger],
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
