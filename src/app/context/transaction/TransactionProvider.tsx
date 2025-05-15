import { SigningStep } from "@babylonlabs-io/btc-staking-ts";
import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

interface TransactionData {
  // Form data
  finalityProviderPK: string | undefined;
  stakingAmount: number;
  stakingTimelock: number | undefined;

  // Network
  covenantNoCoordPks: string[] | undefined;
  covenantQuorum: number | undefined;
  unbondingTimelock: number | undefined;

  // Wallet data
  publicKeyNoCoord: string | undefined;
  bbnAddress: string | undefined;

  // Current signing step
  currentStep: SigningStep | undefined;
}

interface TransactionContextType {
  transactionData: TransactionData;
  setTransactionData: (data: Partial<TransactionData>) => void;
  resetTransactionData: () => void;
}

const initialData: TransactionData = {
  finalityProviderPK: undefined,
  stakingAmount: 0,
  stakingTimelock: undefined,
  unbondingTimelock: undefined,
  covenantNoCoordPks: undefined,
  covenantQuorum: undefined,
  publicKeyNoCoord: undefined,
  bbnAddress: undefined,
  currentStep: undefined,
};

const TransactionContext = createContext<TransactionContextType | undefined>(
  undefined,
);

export const TransactionProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [transactionData, setTransactionDataState] =
    useState<TransactionData>(initialData);

  // Use useCallback to memoize the setter function
  const setTransactionData = useCallback((data: Partial<TransactionData>) => {
    setTransactionDataState((prev) => {
      // Only update if the values actually changed
      const newData = { ...prev, ...data };
      if (
        Object.keys(data).some(
          (key) =>
            prev[key as keyof TransactionData] !==
            data[key as keyof TransactionData],
        )
      ) {
        return newData;
      }
      return prev;
    });
  }, []);

  const resetTransactionData = useCallback(() => {
    setTransactionDataState(initialData);
  }, []);

  const value = useMemo(
    () => ({
      transactionData,
      setTransactionData,
      resetTransactionData,
    }),
    [transactionData, setTransactionData, resetTransactionData],
  );

  return (
    <TransactionContext.Provider value={value}>
      {children}
    </TransactionContext.Provider>
  );
};

export const useTransaction = (): TransactionContextType => {
  const context = useContext(TransactionContext);

  if (context === undefined) {
    throw new Error("useTransaction must be used within a TransactionProvider");
  }

  return context;
};
