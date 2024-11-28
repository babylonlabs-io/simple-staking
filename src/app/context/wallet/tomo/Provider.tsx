import {
  TomoContextProvider,
  useTomoModalControl,
  useTomoProviders,
  useTomoWalletConnect,
  useTomoWalletState,
} from "@tomo-inc/wallet-connect-sdk";
import "@tomo-inc/wallet-connect-sdk/style.css";
import { useTheme } from "next-themes";
import { createContext, useCallback, type PropsWithChildren } from "react";

import { getNetworkConfig } from "@/config/network.config";
import { keplrRegistry } from "@/config/wallet/babylon";

import { BBNWalletProvider } from "./BBNWalletProvider";
import { BTCWalletProvider } from "./BTCWalletProvider";

interface ConnectorProps {
  chain: "bitcoin" | "cosmos";
}

// We have to split the connection into two parts
// so we can use the tomoWalletConnect and tomoModal hooks
const WalletConnectionProvider = ({
  chain,
  children,
}: PropsWithChildren<ConnectorProps>) => {
  const { resolvedTheme } = useTheme();

  const { mempoolApiUrl, network, networkName } = getNetworkConfig();
  const bitcoinChain = {
    id: 1,
    name: networkName,
    type: "bitcoin" as any,
    network: network,
    backendUrls: {
      mempoolUrl: mempoolApiUrl + "/api/",
    },
  };

  return (
    <TomoContextProvider
      bitcoinChains={[bitcoinChain]}
      chainTypes={[chain]}
      cosmosChains={[
        {
          id: 2,
          name: keplrRegistry.chainName,
          type: "cosmos",
          network: keplrRegistry.chainId,
          modularData: keplrRegistry,
          backendUrls: {
            rpcRrl: keplrRegistry.rpc,
          },
          logo: keplrRegistry.chainSymbolImageUrl,
        },
      ]}
      style={{
        rounded: "medium",
        theme: resolvedTheme as "dark" | "light",
        primaryColor: "#FF7C2A",
      }}
    >
      {children}
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

export function TomoProvider({ children }: PropsWithChildren) {
  return (
    <WalletConnectionProvider chain="bitcoin">
      <BTCWalletProvider>
        <WalletConnectionProvider chain="cosmos">
          <BBNWalletProvider>{children}</BBNWalletProvider>
        </WalletConnectionProvider>
      </BTCWalletProvider>
    </WalletConnectionProvider>
  );
}

export const useWalletConnection = () => {
  const tomoModal = useTomoModalControl();
  const tomoWalletConnect = useTomoWalletConnect();
  const tomoWalletState = useTomoWalletState();
  const providers = useTomoProviders();

  const open = useCallback(async () => {
    try {
      await tomoModal.open("connect");
    } catch (e) {
      console.log(e);
    }
  }, [tomoModal]);

  const disconnect = useCallback(async () => {
    await tomoWalletConnect.disconnect();
  }, [tomoWalletConnect]);

  const isConnected = tomoWalletState.isConnected;

  return { open, disconnect, isConnected, providers };
};
