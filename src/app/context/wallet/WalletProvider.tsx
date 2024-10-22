import {
  useTomoModalControl,
  useTomoProviders,
  useTomoWalletConnect,
  useTomoWalletState,
} from "@tomo-inc/wallet-connect-sdk";
import "@tomo-inc/wallet-connect-sdk/style.css";
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
  Network,
  type BTCWalletProvider as IBTCWalletProvider,
} from "@/utils/wallet/btc_wallet_provider";
import { WalletError, WalletErrorType } from "@/utils/wallet/errors";

interface BTCWalletContextProps {
  network?: networks.Network;
  publicKeyNoCoord: string;
  address: string;
  connected: boolean;
  disconnect: () => void;
  open: () => void;
  getWalletProviderName: IBTCWalletProvider["getWalletProviderName"];
  getAddress: IBTCWalletProvider["getAddress"];
  getPublicKeyHex: IBTCWalletProvider["getPublicKeyHex"];
  signPsbt: IBTCWalletProvider["signPsbt"];
  signPsbts: IBTCWalletProvider["signPsbts"];
  getNetwork: IBTCWalletProvider["getNetwork"];
  signMessageBIP322: IBTCWalletProvider["signMessageBIP322"];
  getBalance: IBTCWalletProvider["getBalance"];
  getNetworkFees: IBTCWalletProvider["getNetworkFees"];
  pushTx: IBTCWalletProvider["pushTx"];
  getUtxos: IBTCWalletProvider["getUtxos"];
  getBTCTipHeight: IBTCWalletProvider["getBTCTipHeight"];
  getInscriptions: IBTCWalletProvider["getInscriptions"];
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

// Define the interface for the Cosmos wallet context
interface CosmosWalletContextProps {
  bech32Address: string;
  pubKey: string;
  connected: boolean;
  disconnect: () => void;
  signArbitrary: (message: string) => Promise<any>;
}

const CosmosWalletContext = createContext<CosmosWalletContextProps>({
  bech32Address: "",
  pubKey: "",
  connected: false,
  disconnect: () => {},
  signArbitrary: async () => {},
});

export const WalletProvider = ({ children }: PropsWithChildren) => {
  const [btcWalletProvider, setBTCWalletProvider] =
    useState<IBTCWalletProvider>();
  const [network, setNetwork] = useState<networks.Network>();
  const [publicKeyNoCoord, setPublicKeyNoCoord] = useState("");
  const [address, setAddress] = useState("");

  const [cosmosWalletProvider, setCosmosWalletProvider] = useState<any>();
  const [cosmosBech32Address, setCosmosBech32Address] = useState("");
  const [cosmosPubKey, setCosmosPubKey] = useState("");
  const [cosmosChainID, setCosmosChainID] = useState("");

  const { showError } = useError();

  const tomoModal = useTomoModalControl();
  const tomoWalletConnect = useTomoWalletConnect();

  const tomowalletState = useTomoWalletState();
  const providers = useTomoProviders();

  const disconnect = useCallback(async () => {
    setBTCWalletProvider(undefined);
    setNetwork(undefined);
    setPublicKeyNoCoord("");
    setAddress("");
    setCosmosWalletProvider(undefined);
    setCosmosBech32Address("");
    setCosmosPubKey("");
    await tomoWalletConnect.disconnect();
  }, [tomoWalletConnect]);

  const open = useCallback(async () => {
    await tomoModal.open("connect");
  }, [tomoModal]);

  const connectCosmos = useCallback(async () => {
    if (!providers.cosmosProvider) return;

    try {
      const chainID = providers.cosmosProvider.getChainId();
      const cosmosInfo =
        await providers.cosmosProvider.provider.getKey(chainID);

      const { bech32Address, pubKey } = cosmosInfo;
      setCosmosWalletProvider(providers.cosmosProvider);
      setCosmosBech32Address(bech32Address);
      setCosmosPubKey(Buffer.from(pubKey).toString("hex"));
      setCosmosChainID(chainID);
    } catch (error: any) {
      showError({
        error: {
          message: error.message,
          errorState: ErrorState.WALLET,
        },
        retryAction: connectCosmos,
      });
    }
  }, [providers.cosmosProvider, showError]);

  const cosmosContextValue = useMemo(
    () => ({
      bech32Address: cosmosBech32Address,
      pubKey: cosmosPubKey,
      connected: Boolean(cosmosWalletProvider),
      disconnect,
      open,
      signArbitrary: async (message: string) =>
        await cosmosWalletProvider.provider.signArbitrary(
          cosmosChainID,
          cosmosBech32Address,
          message, // This might be Buffer.from(message)
        ),
    }),
    [
      cosmosChainID,
      cosmosBech32Address,
      cosmosPubKey,
      cosmosWalletProvider,
      disconnect,
      open,
    ],
  );

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

  const connectBTC = useCallback(
    async (walletProvider: IBTCWalletProvider) => {
      const supportedNetworkMessage =
        "Only Native SegWit and Taproot addresses are supported. Please switch the address type in your wallet and try again.";

      try {
        await walletProvider.connectWallet();
        const address = await walletProvider.getAddress();
        // check if the wallet address type is supported in babylon
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
          // User cancelled the connection, hence do nothing
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

  const btcContextValue = useMemo(
    () => ({
      network,
      publicKeyNoCoord,
      address,
      connected: Boolean(btcWalletProvider),
      open,
      disconnect,
      ...btcWalletMethods,
    }),
    [
      btcWalletProvider,
      network,
      publicKeyNoCoord,
      address,
      open,
      disconnect,
      btcWalletMethods,
    ],
  );

  useEffect(() => {
    if (tomowalletState.isConnected && providers.state) {
      if (!btcWalletProvider && providers.bitcoinProvider) {
        connectBTC(providers.bitcoinProvider as unknown as IBTCWalletProvider);
      }
      if (!cosmosWalletProvider && providers.cosmosProvider) {
        connectCosmos();
      }
    }
  }, [
    connectBTC,
    connectCosmos,
    providers.bitcoinProvider,
    providers.cosmosProvider,
    providers.state,
    tomowalletState.isConnected,
    btcWalletProvider,
    cosmosWalletProvider,
  ]);

  return (
    <BTCWalletContext.Provider value={btcContextValue}>
      <CosmosWalletContext.Provider value={cosmosContextValue}>
        {children}
      </CosmosWalletContext.Provider>
    </BTCWalletContext.Provider>
  );
};

export const useBTCWallet = () => useContext(BTCWalletContext);
export const useCosmosWallet = () => useContext(CosmosWalletContext);
