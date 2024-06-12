import { useQuery } from "@tanstack/react-query";
import React, { ReactNode, createContext, useContext } from "react";

import { getGlobalParams } from "@/app/api/getGlobalParams";
import { GlobalParamsVersion } from "@/app/types/globalParams";

interface GlobalParamsProviderProps {
  children: ReactNode;
}

interface GlobalParamsContextType {
  data: GlobalParamsVersion[] | undefined;
  isLoading: boolean;
}

const defaultContextValue: GlobalParamsContextType = {
  data: undefined,
  isLoading: true,
};

const GlobalParamsContext =
  createContext<GlobalParamsContextType>(defaultContextValue);

export const GlobalParamsProvider: React.FC<GlobalParamsProviderProps> = ({
  children,
}) => {
  const { data, isLoading } = useQuery({
    queryKey: ["API_GLOBAL_PARAMS"],
    queryFn: async () => getGlobalParams(),
    refetchInterval: 60000, // 1 minute
  });

  return (
    <GlobalParamsContext.Provider value={{ data, isLoading }}>
      {children}
    </GlobalParamsContext.Provider>
  );
};

/*
 * Global Params Context. Provides the global params from the API.
 */
export const useGlobalParams = () => useContext(GlobalParamsContext);
