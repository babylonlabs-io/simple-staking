import { TomoContextProvider } from "@tomo-inc/wallet-connect-sdk";
import "@tomo-inc/wallet-connect-sdk/style.css";
import { useTheme } from "next-themes";
import { type PropsWithChildren } from "react";

import { getNetworkConfig } from "@/config/network.config";
import { bbnDevnet } from "@/config/wallet/babylon";

export const TomoConnectionProvider = ({ children }: PropsWithChildren) => {
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
      chainTypes={["bitcoin", "cosmos"]}
      cosmosChains={[
        {
          id: 2,
          name: "Babylon Devnet 7",
          type: "cosmos",
          network: "devnet-7",
          modularData: bbnDevnet,
          backendUrls: {
            rpcRrl: "https://rpc.devnet.babylonlabs.io",
          },
          logo: "https://raw.githubusercontent.com/chainapsis/keplr-chain-registry/main/images/bbn-dev/chain.png",
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
