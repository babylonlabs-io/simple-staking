import React, { ReactNode, createContext, useContext } from "react";
import { useQuery } from "@tanstack/react-query";
import { getTipHeight } from "@/utils/mempool_api";
import { getGlobalParams } from "@/app/api/getGlobalParams";
import { GlobalParamsVersion } from "@/app/types/globalParams";

interface GlobalParamsProviderProps {
  children: ReactNode;
}

const GlobalParamsContext = createContext<GlobalParamsVersion[] | undefined>(
  undefined,
);

export const GlobalParamsProvider: React.FC<GlobalParamsProviderProps> = ({
  children,
}) => {
  const { data } = useQuery({
    queryKey: ["API_GLOBAL_PARAMS"],
    queryFn: async () => getGlobalParams(),
    refetchInterval: 60000, // 1 minute
  });

  return (
    <GlobalParamsContext.Provider value={data}>
      {children}
    </GlobalParamsContext.Provider>
  );
};

/*
 * Global Params Context. Provides the global params from the API.
 */
export const useGlobalParams = () => useContext(GlobalParamsContext);
