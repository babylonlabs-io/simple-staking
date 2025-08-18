import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

import { useCosmosWallet } from "@/ui/common/context/wallet/CosmosWalletProvider";
import { useLogger } from "@/ui/common/hooks/useLogger";

export interface PendingOperation {
  validatorAddress: string;
  amount: bigint;
  operationType: "stake" | "unstake";
  timestamp: number;
  walletAddress: string;
}

interface PendingOperationStorage {
  validatorAddress: string;
  amount: string;
  operationType: "stake" | "unstake";
  timestamp: number;
  walletAddress: string;
}

const getPendingOperationsKey = (walletAddress: string) =>
  `baby-pending-operations-${walletAddress}`;

// Create the context
const PendingOperationsContext = createContext<ReturnType<
  typeof usePendingOperationsServiceInternal
> | null>(null);

// Internal hook that contains the actual logic
function usePendingOperationsServiceInternal() {
  const logger = useLogger();
  const { bech32Address } = useCosmosWallet();

  const [pendingOperations, setPendingOperations] = useState<
    PendingOperation[]
  >(() => {
    if (!bech32Address) return [];

    try {
      const storageKey = getPendingOperationsKey(bech32Address);
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const parsedStorage: PendingOperationStorage[] = JSON.parse(stored);
        return parsedStorage.map((item) => ({
          ...item,
          amount: BigInt(item.amount),
        }));
      }
      return [];
    } catch {
      logger.warn("Error getting pending operations from localStorage", {
        tags: {
          bech32Address,
          app: "baby",
        },
      });
      return [];
    }
  });

  // Reset pending operations when wallet address changes
  useEffect(() => {
    if (!bech32Address) {
      setPendingOperations([]);
      return;
    }

    try {
      const storageKey = getPendingOperationsKey(bech32Address);
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const parsedStorage: PendingOperationStorage[] = JSON.parse(stored);
        const operations = parsedStorage.map((item) => ({
          ...item,
          amount: BigInt(item.amount),
        }));
        setPendingOperations(operations);
      } else {
        setPendingOperations([]);
      }
    } catch {
      setPendingOperations([]);
    }
  }, [bech32Address]);

  // Persist pending operations to localStorage
  useEffect(() => {
    if (!bech32Address) return;

    const storageKey = getPendingOperationsKey(bech32Address);
    const storageFormat: PendingOperationStorage[] = pendingOperations.map(
      (item) => ({
        ...item,
        amount: item.amount.toString(),
      }),
    );

    localStorage.setItem(storageKey, JSON.stringify(storageFormat));
  }, [pendingOperations, bech32Address]);

  const addPendingOperation = useCallback(
    (
      validatorAddress: string,
      amount: bigint,
      operationType: "stake" | "unstake",
    ) => {
      if (!bech32Address) return;

      setPendingOperations((prev) => {
        // Find existing operation for this validator and operation type
        const existingOperation = prev.find(
          (op) =>
            op.validatorAddress === validatorAddress &&
            op.operationType === operationType,
        );

        if (existingOperation) {
          // Accumulate amounts for the same validator and operation type
          const updatedOperation: PendingOperation = {
            ...existingOperation,
            amount: existingOperation.amount + amount,
            timestamp: Date.now(), // Update timestamp to latest
          };

          const newState = prev.map((op) =>
            op.validatorAddress === validatorAddress &&
            op.operationType === operationType
              ? updatedOperation
              : op,
          );
          return newState;
        } else {
          // Create new operation
          const pendingOperation: PendingOperation = {
            validatorAddress,
            amount,
            operationType,
            timestamp: Date.now(),
            walletAddress: bech32Address,
          };

          return [...prev, pendingOperation];
        }
      });
    },
    [bech32Address],
  );

  const removePendingOperation = useCallback((validatorAddress: string) => {
    setPendingOperations((prev) =>
      prev.filter((op) => op.validatorAddress !== validatorAddress),
    );
  }, []);

  const clearAllPendingOperations = useCallback(() => {
    setPendingOperations([]);
  }, []);

  // Cleanup function to remove all pending operations from localStorage when epoch changes
  const cleanupAllPendingOperationsFromStorage = useCallback(() => {
    try {
      // Get all localStorage keys that match our pattern
      const allKeys = Object.keys(localStorage);
      const pendingOperationKeys = allKeys.filter((key) =>
        key.startsWith("baby-pending-operations-"),
      );

      // Remove all pending operations for all wallet addresses
      pendingOperationKeys.forEach((storageKey) => {
        localStorage.removeItem(storageKey);
      });

      // Also clear the in-memory state for current wallet
      setPendingOperations([]);
    } catch (error) {
      console.error("[BABY] Error during localStorage cleanup:", error);
    }
  }, []);

  const getPendingOperations = useCallback(() => {
    return pendingOperations;
  }, [pendingOperations]);

  const getPendingOperationsByValidator = useCallback(
    (validatorAddress: string) => {
      return pendingOperations.filter(
        (op) => op.validatorAddress === validatorAddress,
      );
    },
    [pendingOperations],
  );

  const getPendingStake = useCallback(
    (validatorAddress: string) => {
      return pendingOperations.find(
        (op) =>
          op.validatorAddress === validatorAddress &&
          op.operationType === "stake",
      );
    },
    [pendingOperations],
  );

  const getPendingUnstake = useCallback(
    (validatorAddress: string) => {
      return pendingOperations.find(
        (op) =>
          op.validatorAddress === validatorAddress &&
          op.operationType === "unstake",
      );
    },
    [pendingOperations],
  );

  // Calculate total pending stake across all validators
  const getTotalPendingStake = useCallback(() => {
    return pendingOperations
      .filter((op) => op.operationType === "stake")
      .reduce((total, op) => total + op.amount, 0n);
  }, [pendingOperations]);

  // Calculate total pending unstake across all validators
  const getTotalPendingUnstake = useCallback(() => {
    return pendingOperations
      .filter((op) => op.operationType === "unstake")
      .reduce((total, op) => total + op.amount, 0n);
  }, [pendingOperations]);

  // Calculate total pending operations (stake + unstake)
  const getTotalPendingOperations = useCallback(() => {
    return getTotalPendingStake() + getTotalPendingUnstake();
  }, [getTotalPendingStake, getTotalPendingUnstake]);

  return {
    pendingOperations,
    addPendingOperation,
    removePendingOperation,
    clearAllPendingOperations,
    cleanupAllPendingOperationsFromStorage,
    getPendingOperations,
    getPendingOperationsByValidator,
    getPendingStake,
    getPendingUnstake,
    getTotalPendingStake,
    getTotalPendingUnstake,
    getTotalPendingOperations,
  };
}

// Public hook that uses the context
export function usePendingOperationsService() {
  const context = useContext(PendingOperationsContext);
  if (!context) {
    throw new Error(
      "usePendingOperationsService must be used within a PendingOperationsProvider",
    );
  }
  return context;
}

// Provider component
export function PendingOperationsProvider({
  children,
}: {
  children: ReactNode;
}) {
  const service = usePendingOperationsServiceInternal();
  return (
    <PendingOperationsContext.Provider value={service}>
      {children}
    </PendingOperationsContext.Provider>
  );
}
