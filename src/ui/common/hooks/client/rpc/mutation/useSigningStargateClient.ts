import { EncodeObject } from "@cosmjs/proto-signing";
import { DeliverTxResponse, StdFee } from "@cosmjs/stargate";
import { TxRaw } from "cosmjs-types/cosmos/tx/v1beta1/tx";
import { useCallback } from "react";

import { useCosmosWallet } from "@/ui/common/context/wallet/CosmosWalletProvider";
import { ClientError, ERROR_CODES } from "@/ui/common/errors";
import { useLogger } from "@/ui/common/hooks/useLogger";

/**
 * Hook for signing and broadcasting transactions with the Cosmos wallet
 */
export const useSigningStargateClient = () => {
  const { signingStargateClient, bech32Address } = useCosmosWallet();
  const logger = useLogger();

  const handleTransactionError = useCallback(
    (res: DeliverTxResponse, txType: string[]) => {
      const errorMessage = `Failed to send ${txType.join(",")} transaction, code: ${res.code}, txHash: ${res.transactionHash}`;
      const causeError = new Error(
        res.rawLog ||
          "Transaction failed with non-zero code and no raw log provided.",
      );
      const clientError = new ClientError(
        ERROR_CODES.TRANSACTION_SUBMISSION_ERROR,
        errorMessage,
        { cause: causeError },
      );
      return clientError; // Return it to be thrown by the caller
    },
    [],
  );

  /**
   * Simulates a transaction to estimate the gas fee
   * @param msg - The transaction message
   * @returns The gas fee
   */
  const simulate = useCallback(
    (msg: EncodeObject | EncodeObject[]): Promise<number> => {
      const msgArr = Array.isArray(msg) ? msg : [msg];
      if (!signingStargateClient || !bech32Address) {
        const clientError = new ClientError(
          ERROR_CODES.WALLET_NOT_CONNECTED,
          "Wallet not connected for simulation",
        );
        throw clientError;
      }
      if (bech32Address) {
        logger.info("Using Cosmos address for simulation", { bech32Address });
      }
      return signingStargateClient.simulate(
        bech32Address,
        msgArr,
        // Provide an empty memo to avoid exceeding the 256-character limit enforced by the Babylon RPC nodes.
        "",
      );
    },
    [signingStargateClient, bech32Address, logger],
  );

  /**
   * Signs and broadcasts a transaction
   * @param msg - The transaction message
   * @param fee - The gas fee
   * @returns The transaction hash and gas used
   */
  const signAndBroadcast = useCallback(
    async (
      msg: EncodeObject | EncodeObject[],
      fee: StdFee,
    ): Promise<{
      txHash: string;
      gasUsed: string;
    }> => {
      const msgArr = Array.isArray(msg) ? msg : [msg];
      if (!signingStargateClient || !bech32Address) {
        const clientError = new ClientError(
          ERROR_CODES.WALLET_NOT_CONNECTED,
          "Wallet not connected for signAndBroadcast",
        );
        logger.error(clientError);
        throw clientError;
      }
      if (bech32Address) {
        logger.info("Using Cosmos address for signAndBroadcast", {
          bech32Address,
        });
      }
      const res = await signingStargateClient.signAndBroadcast(
        bech32Address,
        msgArr,
        fee,
      );

      if (res.code !== 0) {
        throw handleTransactionError(
          res,
          msgArr.map((msg) => msg.typeUrl),
        );
      }
      return {
        txHash: res.transactionHash,
        gasUsed: res.gasUsed.toString(),
      };
    },
    [signingStargateClient, bech32Address, logger, handleTransactionError],
  );

  /**
   * Signs a transaction
   * @param msg - The transaction message
   * @param fee - The gas fee
   * @returns The signed transaction in bytes
   */
  const signTx = useCallback(
    async (
      msg: EncodeObject | EncodeObject[],
      fee: StdFee,
    ): Promise<Uint8Array> => {
      const msgArr = Array.isArray(msg) ? msg : [msg];
      if (!signingStargateClient || !bech32Address) {
        const clientError = new ClientError(
          ERROR_CODES.WALLET_NOT_CONNECTED,
          "Wallet not connected",
        );
        throw clientError;
      }

      const res = await signingStargateClient.sign(
        bech32Address,
        msgArr,
        fee,
        "",
      );
      return TxRaw.encode(res).finish();
    },
    [signingStargateClient, bech32Address],
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
        const clientError = new ClientError(
          ERROR_CODES.WALLET_NOT_CONNECTED,
          "Wallet not connected",
        );
        throw clientError;
      }

      const res = await signingStargateClient.broadcastTx(tx);
      if (res.code !== 0) {
        throw handleTransactionError(res, ["broadcasted_tx_bytes"]);
      }
      return {
        gasUsed: res.gasUsed.toString(),
        txHash: res.transactionHash,
      };
    },
    [signingStargateClient, bech32Address, handleTransactionError],
  );

  return { simulate, signAndBroadcast, signTx, broadcastTx };
};
