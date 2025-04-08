import { StdFee } from "@cosmjs/stargate";
import { TxRaw } from "cosmjs-types/cosmos/tx/v1beta1/tx";
import { useCallback } from "react";

import { WalletError } from "@/app/context/Error/errors/walletError";
import { useCosmosWallet } from "@/app/context/wallet/CosmosWalletProvider";
import { ChainType } from "@/app/types/network";

/**
 * Hook for signing and broadcasting transactions with the Cosmos wallet
 */
export const useSigningStargateClient = () => {
  const { signingStargateClient, bech32Address, walletProviderName } =
    useCosmosWallet();

  /**
   * Simulates a transaction to estimate the gas fee
   * @param msg - The transaction message
   * @returns The gas fee
   */
  const simulate = useCallback(
    <T>(msg: { typeUrl: string; value: T }): Promise<number> => {
      if (!signingStargateClient || !bech32Address) {
        // wallet error
        throw new WalletError({
          message: "Wallet not connected",
          chainType: ChainType.BBN,
          walletProviderName: walletProviderName,
        });
      }

      // estimate gas
      return signingStargateClient.simulate(
        bech32Address,
        [msg],
        `estimate transaction fee for ${msg.typeUrl}`,
      );
    },
    [signingStargateClient, bech32Address, walletProviderName],
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
        // wallet error
        throw new WalletError({
          message: "Wallet not connected",
          chainType: ChainType.BBN,
          walletProviderName,
        });
      }

      const res = await signingStargateClient.signAndBroadcast(
        bech32Address,
        [msg],
        fee,
      );

      if (res.code !== 0) {
        // wallet error
        throw new WalletError({
          message: `Failed to send ${msg.typeUrl} transaction, code: ${res.code}, txHash: ${res.transactionHash}`,
          chainType: ChainType.BBN,
          walletProviderName,
        });
      }
      return {
        txHash: res.transactionHash,
        gasUsed: res.gasUsed.toString(),
      };
    },
    [signingStargateClient, bech32Address, walletProviderName],
  );

  /**
   * Signs a transaction
   * @param msg - The transaction message
   * @param fee - The gas fee
   * @returns The signed transaction in bytes
   */
  const signTx = useCallback(
    async <T>(
      msg: {
        typeUrl: string;
        value: T;
      },
      fee: StdFee,
    ): Promise<Uint8Array> => {
      if (!signingStargateClient || !bech32Address) {
        // wallet error
        throw new WalletError({
          message: "Wallet not connected",
          chainType: ChainType.BBN,
          walletProviderName,
        });
      }

      const res = await signingStargateClient.sign(
        bech32Address,
        [msg],
        fee,
        "",
      );
      return TxRaw.encode(res).finish();
    },

    [signingStargateClient, bech32Address, walletProviderName],
  );

  /**
   * Broadcasts a transaction
   * @param tx - The transaction in bytes
   * @returns The transaction hash
   */
  const broadcastTx = useCallback(
    async (
      tx: Uint8Array,
    ): Promise<{
      txHash: string;
      gasUsed: string;
    }> => {
      if (!signingStargateClient || !bech32Address) {
        // wallet error
        throw new WalletError({
          message: "Wallet not connected",
          chainType: ChainType.BBN,
          walletProviderName,
        });
      }

      const res = await signingStargateClient.broadcastTx(tx);
      if (res.code !== 0) {
        // wallet error
        throw new WalletError({
          message: `Failed to send transaction, code: ${res.code}, txHash: ${res.transactionHash}`,
          chainType: ChainType.BBN,
          walletProviderName,
        });
      }
      return {
        gasUsed: res.gasUsed.toString(),
        txHash: res.transactionHash,
      };
    },
    [signingStargateClient, bech32Address, walletProviderName],
  );

  return { simulate, signAndBroadcast, signTx, broadcastTx };
};
