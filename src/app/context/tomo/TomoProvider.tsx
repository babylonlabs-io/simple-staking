import { TomoContextProvider } from "@tomo-inc/wallet-connect-sdk";
import "@tomo-inc/wallet-connect-sdk/style.css";
import { useTheme } from "next-themes";
import { type PropsWithChildren } from "react";

import { getNetworkConfigBBN } from "@/config/network/bbn";
import { getNetworkConfigBTC } from "@/config/network/btc";

type ChainType = "bitcoin" | "cosmos";
type ThemeType = "dark" | "light";

export const TomoConnectionProvider = ({ children }: PropsWithChildren) => {
  const { resolvedTheme } = useTheme();

  const { mempoolApiUrl, network, networkName } = getNetworkConfigBTC();
  const { rpc, chainId, chainData } = getNetworkConfigBBN();

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
    name: chainData.chainName,
    type: "cosmos" as ChainType,
    network: chainId,
    modularData: chainData,
    backendUrls: {
      rpcUrl: rpc,
    },
    logo: chainData.chainSymbolImageUrl,
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
