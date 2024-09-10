import { useQuery } from "@tanstack/react-query";
import React, { createContext, useContext, useEffect, useState } from "react";

import {
  getDelegationPoints,
  PaginatedDelegationsPoints,
} from "@/app/api/getDelegationPoints";
import { Delegation } from "@/app/types/delegations";

interface PointsContextType {
  delegationPoints: Map<string, number>;
  isLoading: boolean;
  error: Error | null;
}

const DelegationsPointsContext = createContext<PointsContextType | undefined>(
  undefined,
);

export const useDelegationsPoints = () => {
  const context = useContext(DelegationsPointsContext);
  if (context === undefined) {
    throw new Error(
      "useDelegationsPoints must be used within a DelegationsPointsProvider",
    );
  }
  return context;
};

interface DelegationsPointsProviderProps {
  children: React.ReactNode;
  publicKeyNoCoord: string;
  delegationsAPI: Delegation[];
  isWalletConnected: boolean;
}

export const DelegationsPointsProvider: React.FC<
  DelegationsPointsProviderProps
> = ({ children, publicKeyNoCoord, delegationsAPI, isWalletConnected }) => {
  const [delegationPoints, setDelegationPoints] = useState<Map<string, number>>(
    new Map(),
  );

  const fetchAllPoints = async () => {
    let allPoints: PaginatedDelegationsPoints["data"] = [];
    let paginationKey = "";

    const stakingTxHashHexes = delegationsAPI.map(
      (delegation) => delegation.stakingTxHashHex,
    );

    do {
      const result = await getDelegationPoints(
        paginationKey,
        undefined,
        stakingTxHashHexes,
      );
      allPoints = [...allPoints, ...result.data];
      paginationKey = result.pagination.next_key;
    } while (paginationKey !== "");

    return allPoints;
  };

  const { data, isLoading, error } = useQuery({
    queryKey: ["delegationPoints", publicKeyNoCoord, delegationsAPI],
    queryFn: fetchAllPoints,
    enabled: isWalletConnected && delegationsAPI.length > 0,
  });

  useEffect(() => {
    if (data) {
      const newDelegationPoints = new Map<string, number>();
      data.forEach((point) => {
        newDelegationPoints.set(point.staking_tx_hash_hex, point.staker.points);
      });
      setDelegationPoints(newDelegationPoints);
    }
  }, [data]);

  const value = {
    delegationPoints,
    isLoading,
    error,
  };

  return (
    <DelegationsPointsContext.Provider value={value}>
      {children}
    </DelegationsPointsContext.Provider>
  );
};
