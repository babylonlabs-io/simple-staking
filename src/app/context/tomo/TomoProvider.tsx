import { TomoContextProvider } from "@tomo-inc/wallet-connect-sdk";
import "@tomo-inc/wallet-connect-sdk/style.css";
import { useTheme } from "next-themes";
import { type PropsWithChildren } from "react";

import { getNetworkConfig } from "@/config/network.config";
import { bbnDevnet } from "@/config/wallet/babylon";

type ChainType = "bitcoin" | "cosmos";
type ThemeType = "dark" | "light";

export const TomoConnectionProvider = ({ children }: PropsWithChildren) => {
  const { resolvedTheme } = useTheme();

  const { mempoolApiUrl, network, networkName } = getNetworkConfig();

  const bitcoinChain = {
    id: 1,
    name: networkName,
    type: "bitcoin" as ChainType,
    network: network,
    backendUrls: {
      mempoolUrl: mempoolApiUrl + "/api/",
    },
  };

  const cosmosChain = {
    id: 2,
    name: bbnDevnet.chainName,
    type: "cosmos" as ChainType,
    network: bbnDevnet.chainId,
    modularData: bbnDevnet,
    backendUrls: {
      rpcUrl: bbnDevnet.rpc,
    },
    logo: bbnDevnet.chainSymbolImageUrl,
  };

  return (
    <TomoContextProvider
      bitcoinChains={[bitcoinChain]}
      chainTypes={["bitcoin", "cosmos"]}
      cosmosChains={[cosmosChain]}
      style={{
        rounded: "medium",
        theme: resolvedTheme as ThemeType,
        primaryColor: "#FF7C2A",
      }}
    >
      {children}
    </TomoContextProvider>
  );
};
