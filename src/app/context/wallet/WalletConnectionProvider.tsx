import {
  useTomoModalControl,
  useTomoProviders,
  useTomoWalletConnect,
  useTomoWalletState,
} from "@tomo-inc/wallet-connect-sdk";
import "@tomo-inc/wallet-connect-sdk/style.css";
import {
  createContext,
  useCallback,
  useContext,
  type PropsWithChildren,
} from "react";

interface WalletConnectionContextProps {
  open: () => Promise<void>;
  disconnect: () => Promise<void>;
  isConnected: boolean;
  providers: ReturnType<typeof useTomoProviders>;
  tomoWalletConnect: ReturnType<typeof useTomoWalletConnect>;
  tomoModal: ReturnType<typeof useTomoModalControl>;
  tomoWalletState: ReturnType<typeof useTomoWalletState>;
}

const WalletConnectionContext = createContext<WalletConnectionContextProps>({
  open: async () => {},
  disconnect: async () => {},
  isConnected: false,
  providers: {} as ReturnType<typeof useTomoProviders>,
  tomoWalletConnect: {} as ReturnType<typeof useTomoWalletConnect>,
  tomoModal: {} as ReturnType<typeof useTomoModalControl>,
  tomoWalletState: {} as ReturnType<typeof useTomoWalletState>,
});

export const WalletConnectionProvider = ({ children }: PropsWithChildren) => {
  const tomoModal = useTomoModalControl();
  const tomoWalletConnect = useTomoWalletConnect();
  const tomoWalletState = useTomoWalletState();
  const providers = useTomoProviders();

  const open = useCallback(async () => {
    await tomoModal.open("connect");
  }, [tomoModal]);

  const disconnect = useCallback(async () => {
    await tomoWalletConnect.disconnect();
  }, [tomoWalletConnect]);

  const isConnected = tomoWalletState.isConnected;

  return (
    <WalletConnectionContext.Provider
      value={{
        open,
        disconnect,
        isConnected,
        providers,
        tomoWalletConnect,
        tomoModal,
        tomoWalletState,
      }}
    >
      {children}
    </WalletConnectionContext.Provider>
  );
};

export const useWalletConnection = () => useContext(WalletConnectionContext);
