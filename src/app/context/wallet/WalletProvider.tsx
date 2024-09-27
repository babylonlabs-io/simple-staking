import type { networks } from "bitcoinjs-lib";
import {
  type PropsWithChildren,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { ConnectModal } from "@/app/components/Modals/ConnectModal";
import { useError } from "@/app/context/Error/ErrorContext";
import { ErrorState } from "@/app/types/errors";
import {
  getPublicKeyNoCoord,
  isSupportedAddressType,
  toNetwork,
} from "@/utils/wallet";
import { WalletError, WalletErrorType } from "@/utils/wallet/errors";
import { type WalletProvider as IWalletProvider } from "@/utils/wallet/wallet_provider";

interface WalletContextProps {
  walletProvider?: IWalletProvider;
  network?: networks.Network;
  publicKeyNoCoord: string;
  address: string;
  connected: boolean;
  disconnect: () => void;
  open: () => void;
}

const WalletContext = createContext<WalletContextProps>({
  walletProvider: undefined,
  network: undefined,
  connected: false,
  publicKeyNoCoord: "",
  address: "",
  disconnect: () => () => {},
  open: () => {},
});

export const WalletProvider = ({ children }: PropsWithChildren) => {
  const [walletProvider, setWalletProvider] = useState<IWalletProvider>();
  const [network, setNetwork] = useState<networks.Network>();
  const [publicKeyNoCoord, setPublicKeyNoCoord] = useState("");
  const [address, setAddress] = useState("");
  const [connectModalOpen, setConnectModalOpen] = useState(false);

  const { showError } = useError();

  const disconnect = useCallback(() => {
    setWalletProvider(undefined);
    setNetwork(undefined);
    setPublicKeyNoCoord("");
    setAddress("");
  }, []);

  const open = useCallback(() => {
    setConnectModalOpen(true);
  }, []);

  const connect = useCallback(
    async (walletProvider: IWalletProvider) => {
      // close the modal
      setConnectModalOpen(false);

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

        setWalletProvider(walletProvider);
        setNetwork(toNetwork(await walletProvider.getNetwork()));
        setAddress(address);
        setPublicKeyNoCoord(publicKeyNoCoord.toString("hex"));
      } catch (error: Error | any) {
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
          retryAction: () => connect(walletProvider),
        });
      }
    },
    [showError],
  );

  // Subscribe to account changes
  useEffect(() => {
    if (walletProvider) {
      let once = false;
      walletProvider.on("accountChanged", () => {
        if (!once) {
          connect(walletProvider);
        }
      });
      return () => {
        once = true;
      };
    }
  }, [walletProvider, connect]);

  const contextValue = useMemo(
    () => ({
      walletProvider,
      network,
      publicKeyNoCoord,
      address,
      connected: Boolean(walletProvider),
      open,
      disconnect,
    }),
    [walletProvider, network, publicKeyNoCoord, address, open, disconnect],
  );

  return (
    <WalletContext.Provider value={contextValue}>
      {children}
      <ConnectModal
        open={connectModalOpen}
        onClose={setConnectModalOpen}
        onConnect={connect}
        connectDisabled={!!address}
      />
    </WalletContext.Provider>
  );
};

export const useWallet = () => useContext(WalletContext);
