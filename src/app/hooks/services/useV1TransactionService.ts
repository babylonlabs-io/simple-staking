import {
  BabylonBtcStakingManager,
  getUnbondingTxStakerSignature,
  TransactionResult,
  VersionedStakingParams,
} from "@babylonlabs-io/btc-staking-ts";
import { Transaction } from "bitcoinjs-lib";
import { useCallback, useMemo } from "react";

import { getUnbondingEligibility } from "@/app/api/getUnbondingEligibility";
import { postUnbonding } from "@/app/api/postUnbonding";
import { useBTCWallet } from "@/app/context/wallet/BTCWalletProvider";
import { useAppState } from "@/app/state";
import { ClientError, ERROR_CODES } from "@/errors";
import { useLogger } from "@/hooks/useLogger";
import { validateStakingInput } from "@/utils/delegations";
import { txFeeSafetyCheck } from "@/utils/delegations/fee";
import { getFeeRateFromMempool } from "@/utils/getFeeRateFromMempool";
import { getBbnParamByBtcHeight } from "@/utils/params";

import { useNetworkFees } from "../client/api/useNetworkFees";

import { useStakingManagerService } from "./useStakingManagerService";
import { BtcStakingInputs } from "./useTransactionService";

export function useV1TransactionService() {
  const { publicKeyNoCoord, address: btcAddress, pushTx } = useBTCWallet();
  const { data: networkFees } = useNetworkFees();
  const { defaultFeeRate } = getFeeRateFromMempool(networkFees);
  const { networkInfo } = useAppState();
  const logger = useLogger();

  const stakerBtcInfo = useMemo(
    () => ({
      address: btcAddress,
      publicKeyNoCoordHex: publicKeyNoCoord,
    }),
    [btcAddress, publicKeyNoCoord],
  );

  // We use phase-2 parameters instead of legacy global parameters.
  // Phase-2 BBN parameters include all phase-1 global parameters,
  // except for the "tag" field which is only used for staking transactions.
  // The "tag" is not needed for withdrawal or unbonding transactions.
  const versionedParams = networkInfo?.params.bbnStakingParams?.versions;

  const { createBtcStakingManager } = useStakingManagerService();

  /**
   * Submit the unbonding transaction to babylon API for further processing
   * The system will gather covenant signatures and submit the unbonding
   * transaction to the Bitcoin network
   *
   * @param stakingInput - The staking inputs
   * @param stakingHeight - The height of the staking transaction
   * @param stakingTxHex - The staking transaction hex
   */
  const submitUnbondingTx = useCallback(
    async (
      stakingInput: BtcStakingInputs,
      stakingHeight: number,
      stakingTxHex: string,
    ) => {
      logger.info("Starting unbonding transaction submission", {
        stakingHeight,
      });

      const btcStakingManager = createBtcStakingManager();
      validateCommonInputs(
        btcStakingManager,
        stakingInput,
        stakerBtcInfo,
        versionedParams,
        logger,
      );

      const stakingTx = Transaction.fromHex(stakingTxHex);
      logger.info("Submitting unbonding transaction", {
        stakingTxHash: stakingTx.getId?.() || "",
      });

      // Check if this staking transaction is eligible for unbonding
      const eligibility = await getUnbondingEligibility(stakingTx.getId());
      logger.info("Unbonding eligibility check completed", { eligibility });

      if (!eligibility) {
        const clientError = new ClientError(
          ERROR_CODES.VALIDATION_ERROR,
          "Transaction not eligible for unbonding",
        );
        logger.warn(clientError.message, { errorCode: clientError.errorCode });
        throw clientError;
      }

      // Get the param version based on height
      const { version: paramsVersion } = getBbnParamByBtcHeight(
        stakingHeight,
        versionedParams!,
      );

      logger.info("Creating unbonding transaction", {
        paramsVersion,
        stakingHeight,
      });

      const { transaction: signedUnbondingTx } =
        await btcStakingManager!.createPartialSignedBtcUnbondingTransaction(
          stakerBtcInfo,
          stakingInput,
          paramsVersion,
          stakingTx,
        );

      logger.info("Unbonding transaction created successfully", {
        unbondingTxId: signedUnbondingTx.getId(),
      });

      const stakerSignatureHex =
        getUnbondingTxStakerSignature(signedUnbondingTx);

      try {
        logger.info("Submitting unbonding transaction to API", {
          stakingTxId: stakingTx.getId(),
          unbondingTxId: signedUnbondingTx.getId(),
        });

        const unbondingTxHash = await postUnbonding(
          stakerSignatureHex,
          stakingTx.getId(),
          signedUnbondingTx.getId(),
          signedUnbondingTx.toHex(),
        );

        logger.info("Unbonding transaction submitted successfully", {
          unbondingTxHash,
        });
      } catch (error) {
        const clientError = new ClientError(
          ERROR_CODES.EXTERNAL_SERVICE_UNAVAILABLE,
          `Error submitting unbonding transaction: ${error instanceof Error ? error.message : String(error)}`,
          { cause: error as Error },
        );
        logger.error(clientError, {
          tags: {
            errorCode: clientError.errorCode,
            action: "submitUnbondingTx",
          },
        });
        throw clientError;
      }
    },
    [createBtcStakingManager, stakerBtcInfo, versionedParams, logger],
  );

  /**
   * Submit the withdrawal transaction
   * For withdrawal from a staking transaction that has expired, or from an early
   * unbonding transaction
   * If earlyUnbondingTxHex is provided, the early unbonding transaction will be used,
   * otherwise the staking transaction will be used
   *
   * @param stakingInput - The staking inputs (e.g. amount, timelock, etc.)
   * @param stakingHeight - The height of the staking transaction
   * @param stakingTxHex - The staking transaction hex
   * @param earlyUnbondingTxHex - The early unbonding transaction hex
   */
  const submitWithdrawalTx = useCallback(
    async (
      stakingInput: BtcStakingInputs,
      stakingHeight: number,
      stakingTxHex: string,
      earlyUnbondingTxHex?: string,
    ) => {
      logger.info("Starting withdrawal transaction submission", {
        stakingHeight,
        hasEarlyUnbonding: Boolean(earlyUnbondingTxHex),
      });

      const btcStakingManager = createBtcStakingManager();
      validateCommonInputs(
        btcStakingManager,
        stakingInput,
        stakerBtcInfo,
        versionedParams,
        logger,
      );

      // Get the param version based on height
      const { version: paramVersion } = getBbnParamByBtcHeight(
        stakingHeight,
        versionedParams!,
      );

      validateStakingInput(stakingInput);
      let result: TransactionResult;

      if (earlyUnbondingTxHex) {
        logger.info("Creating withdrawal from early unbonding transaction");
        const earlyUnbondingTx = Transaction.fromHex(earlyUnbondingTxHex);
        result =
          await btcStakingManager!.createSignedBtcWithdrawEarlyUnbondedTransaction(
            stakerBtcInfo,
            stakingInput,
            paramVersion,
            earlyUnbondingTx,
            defaultFeeRate,
          );
      } else {
        logger.info("Creating withdrawal from expired staking transaction");
        result =
          await btcStakingManager!.createSignedBtcWithdrawStakingExpiredTransaction(
            stakerBtcInfo,
            stakingInput,
            paramVersion,
            Transaction.fromHex(stakingTxHex),
            defaultFeeRate,
          );
      }

      logger.info("Withdrawal transaction created", {
        txId: JSON.stringify(result.transaction),
        fee: result.fee,
      });

      // Perform a safety check on the estimated transaction fee
      txFeeSafetyCheck(result.transaction, defaultFeeRate, result.fee);

      const txHash = await pushTx(result.transaction.toHex());
      logger.info("Withdrawal transaction pushed successfully", {
        txHash,
      });
    },
    [
      createBtcStakingManager,
      defaultFeeRate,
      pushTx,
      stakerBtcInfo,
      versionedParams,
      logger,
    ],
  );

  return {
    submitUnbondingTx,
    submitWithdrawalTx,
  };
}

/**
 * Validate the common inputs
 * @param btcStakingManager - The BTC Staking Manager
 * @param stakingInput - The staking inputs (e.g. amount, timelock, etc.)
 * @param stakerInfo - The staker info (e.g. address, public key, etc.)
 */
const validateCommonInputs = (
  btcStakingManager: BabylonBtcStakingManager | null,
  stakingInput: BtcStakingInputs,
  stakerBtcInfo: { address: string; publicKeyNoCoordHex: string },
  versionedParams?: VersionedStakingParams[],
  logger?: ReturnType<typeof useLogger>,
) => {
  validateStakingInput(stakingInput);
  if (!btcStakingManager) {
    const clientError = new ClientError(
      ERROR_CODES.INITIALIZATION_ERROR,
      "BTC Staking Manager not initialized",
    );
    logger?.warn(clientError.message, { errorCode: clientError.errorCode });
    throw clientError;
  }
  if (!stakerBtcInfo.address || !stakerBtcInfo.publicKeyNoCoordHex) {
    const clientError = new ClientError(
      ERROR_CODES.INITIALIZATION_ERROR,
      "Staker info not initialized",
    );
    logger?.warn(clientError.message, { errorCode: clientError.errorCode });
    throw clientError;
  }
  if (!versionedParams?.length) {
    const clientError = new ClientError(
      ERROR_CODES.INITIALIZATION_ERROR,
      "Staking params not loaded",
    );
    logger?.warn(clientError.message, { errorCode: clientError.errorCode });
    throw clientError;
  }
};
