import { QueryClient } from "@cosmjs/stargate";
import { Tendermint34Client } from "@cosmjs/tendermint-rpc";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

import {
  WalletError,
  WalletErrorType,
} from "@/app/context/Error/errors/walletError";
import { ChainType } from "@/app/types/network";
import { getNetworkConfigBBN, network } from "@/config/network/bbn";

import { useCosmosWallet } from "../wallet/CosmosWalletProvider";

interface BbnRpcContextType {
  queryClient: QueryClient | undefined;
  isLoading: boolean;
  error: WalletError | null;
  reconnect: () => Promise<void>;
}

const BbnRpcContext = createContext<BbnRpcContextType>({
  queryClient: undefined,
  isLoading: true,
  error: null,
  reconnect: async () => {},
});

export function BbnRpcProvider({ children }: { children: React.ReactNode }) {
  const [queryClient, setQueryClient] = useState<QueryClient>();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<WalletError | null>(null);
  const { rpc } = getNetworkConfigBBN();
  const { walletProviderName } = useCosmosWallet();

  const connect = useCallback(async () => {
    try {
      const tmClient = await Tendermint34Client.connect(rpc);
      const client = QueryClient.withExtensions(tmClient);
      setQueryClient(client);
      setIsLoading(false);
      setError(null);
    } catch (err) {
      setError(
        new WalletError({
          errorType: WalletErrorType.ConnectionFailed,
          message:
            err instanceof Error
              ? err.message || "Failed to connect"
              : "Failed to connect",
          chainType: ChainType.BBN,
          chainId: network,
          walletProviderName,
        }),
      );
      setIsLoading(false);
    }
  }, [rpc, walletProviderName]);

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      if (mounted) {
        await connect();
      }
    };

    init();

    return () => {
      mounted = false;
    };
  }, [connect]);

  const reconnect = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    await connect();
  }, [connect]);

  return (
    <BbnRpcContext.Provider
      value={{ queryClient, isLoading, error, reconnect }}
    >
      {children}
    </BbnRpcContext.Provider>
  );
}

export const useBbnRpc = () => useContext(BbnRpcContext);
