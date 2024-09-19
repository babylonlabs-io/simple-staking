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

interface DelegationsPointsProviderProps {
  children: React.ReactNode;
  publicKeyNoCoord: string;
  delegationsAPI: Delegation[];
  isWalletConnected: boolean;
  address: string;
}

const MAX_DELEGATION_POINTS_BATCH_SIZE = 200;
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
    const stakingTxHashHexes = delegationsAPI
      .filter((delegation) => !delegation.isOverflow)
      .map((delegation) => delegation.stakingTxHashHex);

    const chunks = [];
    for (
      let i = 0;
      i < stakingTxHashHexes.length;
      i += MAX_DELEGATION_POINTS_BATCH_SIZE
    ) {
      chunks.push(
        stakingTxHashHexes.slice(i, i + MAX_DELEGATION_POINTS_BATCH_SIZE),
      );
    }

    const results = await Promise.all(
      chunks.map((chunk) => getDelegationPointsByStakingTxHashHexes(chunk)),
    );

    return results.flatMap((result) => result);
  };

  const { data, isLoading, error } = useQuery({
    queryKey: ["delegationPoints", address, publicKeyNoCoord],
    queryFn: fetchAllPoints,
    enabled:
      isWalletConnected &&
      delegationsAPI.length > 0 &&
      isApiNormal &&
      !isGeoBlocked,
    refetchInterval: 300000, // Refetch every 5 minutes
    refetchOnWindowFocus: false,
    retry: 1,
  });

  useEffect(() => {
    if (data) {
      const newDelegationPoints = new Map<string, number>();
      data.forEach((point) => {
        if (point) {
          newDelegationPoints.set(
            point.staking_tx_hash_hex,
            point.staker.points,
          );
        }
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
