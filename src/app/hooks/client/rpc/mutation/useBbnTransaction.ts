import { useCallback } from "react";

import { useSigningStargateClient } from "./useSigningStargateClient";

const GAS_MULTIPLIER = 1.5;
const GAS_DENOM = "ubbn";
const GAS_PRICE = 0.002;

export interface BbnGasFee {
  amount: { denom: string; amount: string }[];
  gas: string;
}

/**
 * Transaction service for Babylon which contains all the transactions for
 * interacting with Babylon RPC nodes
 */
export const useBbnTransaction = () => {
  const { simulate, signAndBroadcast } = useSigningStargateClient();

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
          { denom: GAS_DENOM, amount: (gasWanted * GAS_PRICE).toFixed(0) },
        ],
        gas: gasWanted.toString(),
      };
    },
    [simulate],
  );

  /**
   * Sends a transaction to the Babylon network.
   * @param {Object} msg - The transaction message.
   * @returns {Promise<Object>} - The transaction hash and gas used.
   */
  const sendBbnTx = useCallback(
    async <T extends object>(msg: { typeUrl: string; value: T }) => {
      // estimate gas
      const fee = await estimateBbnGasFee(msg);
      // sign it
      await signAndBroadcast(msg, fee);
    },
    [estimateBbnGasFee, signAndBroadcast],
  );

  return {
    sendBbnTx,
    estimateBbnGasFee,
  };
};
