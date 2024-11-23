import {
  type PropsWithChildren,
  createContext,
  useContext,
  useMemo,
  useState,
} from "react";

import { NativeProvider } from "./native";
import { TomoProvider } from "./tomo";

export type WalletConnectorName = "native" | "tomo";

type WalletConnectors = {
  BTC: WalletConnectorName;
  BBN: WalletConnectorName;
  setBBNConnector: (value: WalletConnectorName) => void;
  setBTCConnector: (value: WalletConnectorName) => void;
};

const WalletConnectorContext = createContext<WalletConnectors>({
  BTC: "native",
  BBN: "native",
  setBTCConnector: () => {},
  setBBNConnector: () => {},
});

export const WalletConnector = ({ children }: PropsWithChildren) => {
  const [btcConnector, setBTCConnector] =
    useState<WalletConnectorName>("native");
  const [cosmosConnector, setBBNConnector] =
    useState<WalletConnectorName>("native");

  const context = useMemo(
    () => ({
      BTC: btcConnector,
      BBN: cosmosConnector,
      setBTCConnector,
      setBBNConnector,
    }),
    [btcConnector, cosmosConnector],
  );

  return (
    <WalletConnectorContext.Provider value={context}>
      <TomoProvider>
        <NativeProvider>{children}</NativeProvider>
      </TomoProvider>
    </WalletConnectorContext.Provider>
  );
};

export const useWalletConnector = () => useContext(WalletConnectorContext);
