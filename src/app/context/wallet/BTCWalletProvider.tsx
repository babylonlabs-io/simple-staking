"use client";
import {
  IBTCProvider,
  useChainConnector,
  useWalletConnect,
  UTXO,
} from "@babylonlabs-io/bbn-wallet-connect";
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
import { getPublicKeyNoCoord, toNetwork } from "@/utils/wallet";
import {
  Fees,
  InscriptionIdentifier,
  Network,
} from "@/utils/wallet/btc_wallet_provider";
import { WalletError, WalletErrorType } from "@/utils/wallet/errors";

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
  const [btcWalletProvider, setBTCWalletProvider] = useState<IBTCProvider>();
  const [network, setNetwork] = useState<networks.Network>();
  const [publicKeyNoCoord, setPublicKeyNoCoord] = useState("");
  const [address, setAddress] = useState("");

  const { showError, captureError } = useError();
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

      try {
        const address = await walletProvider.getAddress();

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
        showError({
          error: {
            message: error?.message,
            errorState: ErrorState.WALLET,
          },
          retryAction: () => connectBTC(walletProvider),
        });
        captureError(error);
      }
    },
    [showError, captureError],
  );

  useEffect(() => {
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

    const cb = () => void connectBTC(btcWalletProvider);
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
      signMessage: async (
        message: string,
        type: "ecdsa" | "bip322-simple" = "bip322-simple",
      ) => btcWalletProvider?.signMessage(message, type) ?? "",
      getBalance: async () => btcWalletProvider?.getBalance() ?? 0,
      getNetworkFees: async () =>
        btcWalletProvider?.getNetworkFees() ?? ({} as Fees),
      pushTx: async (txHex: string) => btcWalletProvider?.pushTx(txHex) ?? "",
      getUtxos: async (address: string, amount?: number) =>
        btcWalletProvider?.getUtxos(address, amount) ?? [],
      getBTCTipHeight: async () => btcWalletProvider?.getBTCTipHeight() ?? 0,
      getInscriptions: async (): Promise<InscriptionIdentifier[]> =>
        btcWalletProvider?.getInscriptions().catch(() => []) ?? [],
    }),
    [btcWalletProvider],
  );

  const btcContextValue = useMemo(
    () => ({
      network,
      publicKeyNoCoord,
      address,
      connected,
      open,
      disconnect: btcDisconnect,
      ...btcWalletMethods,
    }),
    [
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
