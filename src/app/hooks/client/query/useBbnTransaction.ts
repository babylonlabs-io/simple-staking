import { useCallback } from "react";

import { useCosmosWallet } from "@/app/context/wallet/CosmosWalletProvider";

export interface BbnGasFee {
  amount: { denom: string; amount: string }[];
  gas: string;
}

/**
 * Transaction service for Babylon which contains all the transactions for
 * interacting with Babylon RPC nodes
 */
export const useBbnTransaction = () => {
  const { signingStargateClient, bech32Address } = useCosmosWallet();

  /**
   * Estimates the gas fee for a transaction.
   * @param {Object} msg - The transaction message.
   * @returns {Promise<Object>} - The gas fee.
   */
  const estimateBbnGasFee = useCallback(
    async <T>(msg: { typeUrl: string; value: T }): Promise<BbnGasFee> => {
      if (!signingStargateClient || !bech32Address) {
        throw new Error("Wallet not connected");
      }

      // estimate gas
      const gasEstimate = await signingStargateClient.simulate(
        bech32Address,
        [msg],
        `estimate transaction fee for ${msg.typeUrl}`,
      );
      // TODO: The gas calculation need to be improved
      // https://github.com/babylonlabs-io/simple-staking/issues/320
      const gasWanted = Math.ceil(gasEstimate * 1.5);
      return {
        amount: [{ denom: "ubbn", amount: (gasWanted * 0.01).toFixed(0) }],
        gas: gasWanted.toString(),
      };
    },
    [signingStargateClient, bech32Address],
  );

  /**
   * Sends a transaction to the Babylon network.
   * @param {Object} msg - The transaction message.
   * @returns {Promise<Object>} - The transaction hash and gas used.
   */
  const sendBbnTx = useCallback(
    async <T extends object>(msg: {
      typeUrl: string;
      value: T;
    }): Promise<{ txHash: string; gasUsed: string }> => {
      if (!signingStargateClient || !bech32Address) {
        throw new Error("Wallet not connected");
      }

      // estimate gas
      const fee = await estimateBbnGasFee(msg);

      // sign it
      const res = await signingStargateClient.signAndBroadcast(
        bech32Address,
        [msg],
        fee,
      );
      if (res.code !== 0) {
        throw new Error(
          `Failed to send ${msg.typeUrl} transaction, code: ${res.code}, txHash: ${res.transactionHash}`,
        );
      }
      return {
        txHash: res.transactionHash,
        gasUsed: res.gasUsed.toString(),
      };
    },
    [signingStargateClient, bech32Address, estimateBbnGasFee],
  );

  return {
    sendBbnTx,
    estimateBbnGasFee,
  };
};
