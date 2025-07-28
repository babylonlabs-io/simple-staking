import { UTXO } from "@babylonlabs-io/btc-staking-ts";
import { useCallback, useEffect, useState } from "react";

import { getTxHex } from "@/ui/common/utils/mempool_api";

interface UseFundingTransactionResult {
  fundingTx: Uint8Array | null;
  isLoading: boolean;
  error: string | null;
  fetchFundingTransaction: (utxo: UTXO) => Promise<void>;
  reset: () => void;
}

export function useFundingTransaction(): UseFundingTransactionResult {
  const [fundingTx, setFundingTx] = useState<Uint8Array | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchFundingTransaction = useCallback(async (utxo: UTXO) => {
    if (!utxo?.txid) {
      setError("Invalid UTXO: missing transaction ID");
      return;
    }

    setIsLoading(true);
    setError(null);
    setFundingTx(null);

    try {
      const txHex = await getTxHex(utxo.txid);

      if (!txHex) {
        throw new Error("Failed to fetch transaction hex");
      }

      const txBuffer = Buffer.from(txHex, "hex");

      setFundingTx(txBuffer);
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Failed to fetch funding transaction";
      setError(errorMessage);
      console.error("Error fetching funding transaction:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setFundingTx(null);
    setError(null);
    setIsLoading(false);
  }, []);

  return {
    fundingTx,
    isLoading,
    error,
    fetchFundingTransaction,
    reset,
  };
}

// Helper hook for automatic fetching when UTXO changes
export function useAutoFundingTransaction(selectedUtxo: UTXO | null) {
  const { fundingTx, isLoading, error, fetchFundingTransaction, reset } =
    useFundingTransaction();

  useEffect(() => {
    if (selectedUtxo) {
      fetchFundingTransaction(selectedUtxo);
    } else {
      reset();
    }
  }, [selectedUtxo, fetchFundingTransaction, reset]);

  return {
    fundingTx,
    isLoading,
    error,
  };
}
