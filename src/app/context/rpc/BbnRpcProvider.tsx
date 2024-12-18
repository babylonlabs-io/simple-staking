import { QueryClient } from "@cosmjs/stargate";
import { Tendermint34Client } from "@cosmjs/tendermint-rpc";
import { createContext, useContext, useEffect, useState } from "react";

import { BBN_RPC_URL } from "@/app/common/rpc";

interface BbnRpcContextType {
  queryClient: QueryClient | undefined;
  isLoading: boolean;
  error: Error | null;
}

const BbnRpcContext = createContext<BbnRpcContextType>({
  queryClient: undefined,
  isLoading: true,
  error: null,
});

export function BbnRpcProvider({ children }: { children: React.ReactNode }) {
  const [queryClient, setQueryClient] = useState<QueryClient>();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      try {
        const tmClient = await Tendermint34Client.connect(BBN_RPC_URL);
        const client = QueryClient.withExtensions(tmClient);

        if (mounted) {
          setQueryClient(client);
          setIsLoading(false);
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err : new Error("Failed to connect"));
          setIsLoading(false);
        }
      }
    };

    init();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <BbnRpcContext.Provider value={{ queryClient, isLoading, error }}>
      {children}
    </BbnRpcContext.Provider>
  );
}

export const useBbnRpc = () => useContext(BbnRpcContext);