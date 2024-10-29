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

import { useError } from "@/app/context/Error/ErrorContext";
import { ErrorState } from "@/app/types/errors";
import {
  getPublicKeyNoCoord,
  isSupportedAddressType,
  toNetwork,
} from "@/utils/wallet";
import {
  Fees,
  InscriptionIdentifier,
  Network,
  UTXO,
  type BTCWalletProvider as IBTCWalletProvider,
} from "@/utils/wallet/btc_wallet_provider";
import { WalletError, WalletErrorType } from "@/utils/wallet/errors";

import { useWalletConnection } from "./WalletConnectionProvider";

interface BTCWalletContextProps {
  network?: networks.Network;
  publicKeyNoCoord: string;
  address: string;
  connected: boolean;
  disconnect: () => void;
  open: () => void;
  getWalletProviderName: () => Promise<string>;
  getAddress: () => Promise<string>;
  getPublicKeyHex: () => Promise<string>;
  signPsbt: (psbtHex: string) => Promise<string>;
  signPsbts: (psbtsHexes: string[]) => Promise<string[]>;
  getNetwork: () => Promise<Network>;
  signMessageBIP322: (message: string) => Promise<string>;
  getBalance: () => Promise<number>;
  getNetworkFees: () => Promise<Fees>;
  pushTx: (txHex: string) => Promise<string>;
  getUtxos: (address: string, amount?: number) => Promise<UTXO[]>;
  getBTCTipHeight: () => Promise<number>;
  getInscriptions: () => Promise<InscriptionIdentifier[]>;
}

const BTCWalletContext = createContext<BTCWalletContextProps>({
  network: undefined,
  connected: false,
  publicKeyNoCoord: "",
  address: "",
  disconnect: () => {},
  open: () => {},
  getWalletProviderName: () => Promise.resolve(""),
  getAddress: () => Promise.resolve(""),
  getPublicKeyHex: () => Promise.resolve(""),
  signPsbt: () => Promise.resolve(""),
  signPsbts: () => Promise.resolve([]),
  getNetwork: () => Promise.resolve({} as Network),
  signMessageBIP322: () => Promise.resolve(""),
  getBalance: () => Promise.resolve(0),
  getNetworkFees: () => Promise.resolve({} as Fees),
  pushTx: () => Promise.resolve(""),
  getUtxos: () => Promise.resolve([]),
  getBTCTipHeight: () => Promise.resolve(0),
  getInscriptions: () => Promise.resolve([]),
});

export const BTCWalletProvider = ({ children }: PropsWithChildren) => {
  const [btcWalletProvider, setBTCWalletProvider] =
    useState<IBTCWalletProvider>();
  const [network, setNetwork] = useState<networks.Network>();
  const [publicKeyNoCoord, setPublicKeyNoCoord] = useState("");
  const [address, setAddress] = useState("");

  const { showError, captureError } = useError();
  const { open, isConnected, providers } = useWalletConnection();

  const btcDisconnect = useCallback(() => {
    setBTCWalletProvider(undefined);
    setNetwork(undefined);
    setPublicKeyNoCoord("");
    setAddress("");
  }, []);

  const connectBTC = useCallback(
    async (walletProvider: IBTCWalletProvider) => {
      const supportedNetworkMessage =
        "Only Native SegWit and Taproot addresses are supported. Please switch the address type in your wallet and try again.";

      try {
        await walletProvider.connectWallet();
        const address = await walletProvider.getAddress();
        const supported = isSupportedAddressType(address);
        if (!supported) {
          throw new Error(supportedNetworkMessage);
        }

        const publicKeyNoCoord = getPublicKeyNoCoord(
          await walletProvider.getPublicKeyHex(),
        );

        setBTCWalletProvider(walletProvider);
        setNetwork(toNetwork(await walletProvider.getNetwork()));
        setAddress(address);
        setPublicKeyNoCoord(publicKeyNoCoord.toString("hex"));
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
        showError({
          error: {
            message: errorMessage,
            errorState: ErrorState.WALLET,
          },
          retryAction: () => connectBTC(walletProvider),
        });
        captureError(error);
      }
    },
    [showError],
  );

  // Listen for BTC account changes
  useEffect(() => {
    if (btcWalletProvider) {
      let once = false;
      btcWalletProvider.on("accountChanged", () => {
        if (!once) {
          connectBTC(btcWalletProvider);
        }
      });
      return () => {
        once = true;
      };
    }
  }, [btcWalletProvider, connectBTC]);

  const btcWalletMethods = useMemo(
    () => ({
      getWalletProviderName: () => btcWalletProvider!.getWalletProviderName(),
      getAddress: () => btcWalletProvider!.getAddress(),
      getPublicKeyHex: () => btcWalletProvider!.getPublicKeyHex(),
      signPsbt: (psbtHex: string) => btcWalletProvider!.signPsbt(psbtHex),
      signPsbts: (psbtsHexes: string[]) =>
        btcWalletProvider!.signPsbts(psbtsHexes),
      getNetwork: () => btcWalletProvider!.getNetwork(),
      signMessageBIP322: (message: string) =>
        btcWalletProvider!.signMessageBIP322(message),
      getBalance: () => btcWalletProvider!.getBalance(),
      getNetworkFees: () => btcWalletProvider!.getNetworkFees(),
      pushTx: (txHex: string) => btcWalletProvider!.pushTx(txHex),
      getUtxos: (address: string, amount?: number) =>
        btcWalletProvider!.getUtxos(address, amount),
      getBTCTipHeight: () => btcWalletProvider!.getBTCTipHeight(),
      getInscriptions: () => btcWalletProvider!.getInscriptions(),
    }),
    [btcWalletProvider],
  );

  const btcContextValue = useMemo(
    () => ({
      network,
      publicKeyNoCoord,
      address,
      connected: Boolean(btcWalletProvider),
      open,
      disconnect: btcDisconnect,
      ...btcWalletMethods,
    }),
    [
      btcWalletProvider,
      network,
      publicKeyNoCoord,
      address,
      open,
      btcDisconnect,
      btcWalletMethods,
    ],
  );

  useEffect(() => {
    if (isConnected && providers.state) {
      if (!btcWalletProvider && providers.bitcoinProvider) {
        connectBTC(providers.bitcoinProvider as unknown as IBTCWalletProvider);
      }
    }
  }, [
    connectBTC,
    providers.bitcoinProvider,
    providers.state,
    isConnected,
    btcWalletProvider,
  ]);

  // Clean up the state when isConnected becomes false
  useEffect(() => {
    if (!isConnected) {
      btcDisconnect();
    }
  }, [isConnected, btcDisconnect]);

  return (
    <BTCWalletContext.Provider value={btcContextValue}>
      {children}
    </BTCWalletContext.Provider>
  );
};

export const useBTCWallet = () => useContext(BTCWalletContext);
