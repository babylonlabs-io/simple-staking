import { useQuery } from "@tanstack/react-query";
import React, { createContext, useContext, useEffect, useState } from "react";

import { getDelegationPointsByStakingTxHashHexes } from "@/app/api/getPoints";
import { useHealthCheck } from "@/app/hooks/useHealthCheck";
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
  address: string;
}

export const DelegationsPointsProvider: React.FC<
  DelegationsPointsProviderProps
> = ({
  children,
  publicKeyNoCoord,
  delegationsAPI,
  isWalletConnected,
  address,
}) => {
  const [delegationPoints, setDelegationPoints] = useState<Map<string, number>>(
    new Map(),
  );
  const { isApiNormal, isGeoBlocked } = useHealthCheck();

  const fetchAllPoints = async () => {
    const stakingTxHashHexes = delegationsAPI.map(
      (delegation) => delegation.stakingTxHashHex,
    );

    const chunkSize = 100;
    const chunks = [];
    for (let i = 0; i < stakingTxHashHexes.length; i += chunkSize) {
      chunks.push(stakingTxHashHexes.slice(i, i + chunkSize));
    }

    const results = await Promise.all(
      chunks.map((chunk) => getDelegationPointsByStakingTxHashHexes(chunk)),
    );

    return results.flatMap((result) => result.data);
  };

  const { data, isLoading, error } = useQuery({
    queryKey: ["delegationPoints", address, publicKeyNoCoord],
    queryFn: fetchAllPoints,
    enabled:
      isWalletConnected &&
      delegationsAPI.length > 0 &&
      isApiNormal &&
      !isGeoBlocked,
    refetchInterval: 60000, // Refetch every 60 seconds
    refetchOnWindowFocus: false,
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
