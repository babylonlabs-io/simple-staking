import { StdFee } from "@cosmjs/stargate";
import { useCallback } from "react";

import { useCosmosWallet } from "@/app/context/wallet/CosmosWalletProvider";

/**
 * Hook for signing and broadcasting transactions with the Cosmos wallet
 */
export const useSigningStargateClient = () => {
  const { signingStargateClient, bech32Address } = useCosmosWallet();

  /**
   * Simulates a transaction to estimate the gas fee
   * @param msg - The transaction message
   * @returns The gas fee
   */
  const simulate = useCallback(
    <T>(msg: { typeUrl: string; value: T }): Promise<number> => {
      if (!signingStargateClient || !bech32Address) {
        throw new Error("Wallet not connected");
      }

      // estimate gas
      return signingStargateClient.simulate(
        bech32Address,
        [msg],
        `estimate transaction fee for ${msg.typeUrl}`,
      );
    },
    [signingStargateClient, bech32Address],
  );

  /**
   * Signs and broadcasts a transaction
   * @param msg - The transaction message
   * @param fee - The gas fee
   * @returns The transaction hash and gas used
   */
  const signAndBroadcast = useCallback(
    async <T>(
      msg: {
        typeUrl: string;
        value: T;
      },
      fee: StdFee,
    ): Promise<{
      txHash: string;
      gasUsed: string;
    }> => {
      if (!signingStargateClient || !bech32Address) {
        throw new Error("Wallet not connected");
      }

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
    [signingStargateClient, bech32Address],
  );

  return { simulate, signAndBroadcast };
};
