import type { BTCProvider } from "@tomo-inc/tomo-wallet-provider";
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
  getAddress: () => Promise<string>;
  getPublicKeyHex: () => Promise<string>;
  signPsbt: (psbtHex: string) => Promise<string>;
  signPsbts: (psbtsHexes: string[]) => Promise<string[]>;
  getNetwork: () => Promise<Network>;
  signMessage: (
    message: string,
    type?: "ecdsa" | "bip322-simple",
  ) => Promise<string>;
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
  getAddress: async () => "",
  getPublicKeyHex: async () => "",
  signPsbt: async () => "",
  signPsbts: async () => [],
  getNetwork: async () => ({}) as Network,
  signMessage: async () => "",
  getBalance: async () => 0,
  getNetworkFees: async () => ({}) as Fees,
  pushTx: async () => "",
  getUtxos: async () => [],
  getBTCTipHeight: async () => 0,
  getInscriptions: async () => [],
});

export const BTCWalletProvider = ({ children }: PropsWithChildren) => {
  const [btcWalletProvider, setBTCWalletProvider] = useState<BTCProvider>();
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
    async (walletProvider: BTCProvider) => {
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
    [showError, captureError],
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
      getAddress: async () => btcWalletProvider?.getAddress() ?? "",
      getPublicKeyHex: async () => btcWalletProvider?.getPublicKeyHex() ?? "",
      signPsbt: async (psbtHex: string) =>
        btcWalletProvider?.signPsbt(psbtHex) ?? "",
      signPsbts: async (psbtsHexes: string[]) =>
        btcWalletProvider?.signPsbts(psbtsHexes) ?? [],
      getNetwork: async () =>
        btcWalletProvider?.getNetwork() ?? ({} as Network),
      signMessage: async (message: string, type?: "ecdsa" | "bip322-simple") =>
        btcWalletProvider?.signMessage(message, type) ?? "",
      getBalance: async () => btcWalletProvider?.getBalance() ?? 0,
      getNetworkFees: async () =>
        btcWalletProvider?.getNetworkFees() ?? ({} as Fees),
      pushTx: async (txHex: string) => btcWalletProvider?.pushTx(txHex) ?? "",
      getUtxos: async (address: string, amount?: number) =>
        btcWalletProvider?.getUtxos(address, amount) ?? [],
      getBTCTipHeight: async () => btcWalletProvider?.getBTCTipHeight() ?? 0,
      getInscriptions: async (): Promise<InscriptionIdentifier[]> =>
        btcWalletProvider
          ?.getInscriptions()
          .then((result) =>
            result.list.map((ordinal) => ({
              txid: ordinal.inscriptionId,
              vout: ordinal.outputValue,
            })),
          )
          .catch((e) => []) ?? [],
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
        connectBTC(providers.bitcoinProvider);
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
