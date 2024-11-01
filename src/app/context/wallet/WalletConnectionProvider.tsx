import {
  tomoBitcoin,
  tomoBitcoinSignet,
  TomoContextProvider,
  useTomoModalControl,
  useTomoProviders,
  useTomoWalletConnect,
  useTomoWalletState,
} from "@tomo-inc/wallet-connect-sdk";
import "@tomo-inc/wallet-connect-sdk/style.css";
import { useTheme } from "next-themes";
import {
  createContext,
  useCallback,
  useContext,
  type PropsWithChildren,
} from "react";

import { network } from "@/config/network.config";

import { keplrRegistry } from "./keplrSetup";

// We have to split the connection into two parts
// so we can use the tomoWalletConnect and tomoModal hooks
export const WalletConnectionProvider = ({ children }: PropsWithChildren) => {
  const { resolvedTheme } = useTheme();

  const bitcoinChains = [tomoBitcoin, tomoBitcoinSignet].filter(
    (item) => item.network === network,
  );

  return (
    <TomoContextProvider
      bitcoinChains={bitcoinChains}
      chainTypes={["bitcoin", "cosmos"]}
      // TODO change options (ordinals) wording as soon as it's available
      cosmosChains={[
        {
          id: 2,
          name: "Babylon Devnet 4",
          type: "cosmos",
          network: "devnet-4",
          modularData: keplrRegistry,
          rpc: "https://rpc.devnet.babylonlabs.io",
          nativeCurrency: {
            name: "BBN",
            symbol: "BBN",
            decimals: 6,
          },
          logo: "https://raw.githubusercontent.com/chainapsis/keplr-chain-registry/main/images/bbn-dev/chain.png",
        },
      ]}
      style={{
        rounded: "medium",
        theme: resolvedTheme as "dark" | "light",
        primaryColor: "#FF7C2A",
      }}
      uiOptions={{
        termsAndServiceUrl: "https://babylonlabs.io/terms-of-use",
        privacyPolicyUrl: "https://babylonlabs.io/privacy-policy",
      }}
    >
      <WalletConnectionProviderInternal>
        {children}
      </WalletConnectionProviderInternal>
    </TomoContextProvider>
  );
};

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

const WalletConnectionProviderInternal = ({ children }: PropsWithChildren) => {
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
