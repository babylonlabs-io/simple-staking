import {
  tomoBitcoin,
  tomoBitcoinSignet,
  TomoContextProvider,
} from "@tomo-inc/wallet-connect-sdk";
import "@tomo-inc/wallet-connect-sdk/style.css";
import { useTheme } from "next-themes";
import { PropsWithChildren } from "react";

import { network } from "@/config/network.config";

export const TomoProvider = ({ children }: PropsWithChildren) => {
  const { resolvedTheme } = useTheme();

  const bitcoinChains = [tomoBitcoin, tomoBitcoinSignet].filter(
    (item) => item.network === network,
  );

  return (
    <TomoContextProvider
      // TODO add a list of supported wallets based on the network
      bitcoinChains={bitcoinChains}
      multiNetworkConnection={true}
      cosmosChains={[
        {
          id: 1,
          name: "Babylon Devnet",
          type: "cosmos",
          network: "bbn-dev-5",
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
      {children}
    </TomoContextProvider>
  );
};
