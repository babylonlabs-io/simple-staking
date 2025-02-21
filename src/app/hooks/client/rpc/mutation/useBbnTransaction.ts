import { useCallback } from "react";

import { BBN_GAS_PRICE } from "@/config";

import { useSigningStargateClient } from "./useSigningStargateClient";

const GAS_MULTIPLIER = 1.5;
const GAS_DENOM = "ubbn";

export interface BbnGasFee {
  amount: { denom: string; amount: string }[];
  gas: string;
}

/**
 * Transaction service for Babylon which contains all the transactions for
 * interacting with Babylon RPC nodes
 */
export const useBbnTransaction = () => {
  const { simulate, signTx, broadcastTx } = useSigningStargateClient();

  /**
   * Estimates the gas fee for a transaction.
   * @param {Object} msg - The transaction message.
   * @returns {Promise<Object>} - The gas fee.
   */
  const estimateBbnGasFee = useCallback(
    async <T>(msg: { typeUrl: string; value: T }): Promise<BbnGasFee> => {
      const gasEstimate = await simulate(msg);
      const gasWanted = Math.ceil(gasEstimate * GAS_MULTIPLIER);
      return {
        amount: [
          { denom: GAS_DENOM, amount: (gasWanted * BBN_GAS_PRICE).toFixed(0) },
        ],
        gas: gasWanted.toString(),
      };
    },
    [simulate],
  );

  /**
   * Sign a transaction
   * @param {Object} msg - The transaction message.
   * @returns The signed transaction in bytes
   */
  const signBbnTx = useCallback(
    async <T extends object>(msg: {
      typeUrl: string;
      value: T;
    }): Promise<Uint8Array> => {
      // estimate gas
      const fee = await estimateBbnGasFee(msg);
      // sign it
      return signTx(msg, fee);
    },
    [estimateBbnGasFee, signTx],
  );

  /**
   * Sends a transaction to the Babylon network.
   * @param {Uint8Array} tx - The transaction in bytes.
   * @returns {Promise<{txHash: string; gasUsed: string;}>} - The transaction hash and gas used.
   */
  const sendBbnTx = useCallback(
    async (tx: Uint8Array) => {
      return broadcastTx(tx);
    },
    [broadcastTx],
  );

  return {
    signBbnTx,
    sendBbnTx,
    estimateBbnGasFee,
  };
};
