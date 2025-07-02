import {
  BabylonBtcStakingManager,
  getUnbondingTxStakerSignature,
  TransactionResult,
  VersionedStakingParams,
} from "@babylonlabs-io/btc-staking-ts";
import { Transaction } from "bitcoinjs-lib";
import { useCallback, useMemo } from "react";

import { getUnbondingEligibility } from "@/ui/common/api/getUnbondingEligibility";
import { postUnbonding } from "@/ui/common/api/postUnbonding";
import { useBTCWallet } from "@/ui/common/context/wallet/BTCWalletProvider";
import { ClientError, ERROR_CODES } from "@/ui/common/errors";
import { useLogger } from "@/ui/common/hooks/useLogger";
import { useAppState } from "@/ui/common/state";
import { validateStakingInput } from "@/ui/common/utils/delegations";
import { txFeeSafetyCheck } from "@/ui/common/utils/delegations/fee";
import { getFeeRateFromMempool } from "@/ui/common/utils/getFeeRateFromMempool";
import { getBbnParamByBtcHeight } from "@/ui/common/utils/params";

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
      const btcStakingManager = createBtcStakingManager();
      validateCommonInputs(
        btcStakingManager,
        stakingInput,
        stakerBtcInfo,
        versionedParams,
        logger,
      );

      const stakingTx = Transaction.fromHex(stakingTxHex);

      // Check if this staking transaction is eligible for unbonding
      const eligibility = await getUnbondingEligibility(stakingTx.getId());

      if (!eligibility) {
        const clientError = new ClientError(
          ERROR_CODES.VALIDATION_ERROR,
          "Transaction not eligible for unbonding",
        );
        logger.warn(clientError.message);
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

      const stakerSignatureHex =
        getUnbondingTxStakerSignature(signedUnbondingTx);

      try {
        logger.info("Submitting unbonding transaction to API", {
          stakingTxId: stakingTx.getId(),
          unbondingTxId: signedUnbondingTx.getId(),
        });

        await postUnbonding(
          stakerSignatureHex,
          stakingTx.getId(),
          signedUnbondingTx.getId(),
          signedUnbondingTx.toHex(),
        );
      } catch (error) {
        const clientError = new ClientError(
          ERROR_CODES.EXTERNAL_SERVICE_UNAVAILABLE,
          `Error submitting unbonding transaction: ${error instanceof Error ? error.message : String(error)}`,
          { cause: error as Error },
        );
        logger.error(clientError);
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

      let result: TransactionResult;

      if (earlyUnbondingTxHex) {
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
        result =
          await btcStakingManager!.createSignedBtcWithdrawStakingExpiredTransaction(
            stakerBtcInfo,
            stakingInput,
            paramVersion,
            Transaction.fromHex(stakingTxHex),
            defaultFeeRate,
          );
      }

      // Perform a safety check on the estimated transaction fee
      txFeeSafetyCheck(result.transaction, defaultFeeRate, result.fee);

      await pushTx(result.transaction.toHex());
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
    logger?.warn(clientError.message);
    throw clientError;
  }
  if (!stakerBtcInfo.address || !stakerBtcInfo.publicKeyNoCoordHex) {
    const clientError = new ClientError(
      ERROR_CODES.INITIALIZATION_ERROR,
      "Staker info not initialized",
    );
    logger?.warn(clientError.message);
    throw clientError;
  }
  if (!versionedParams?.length) {
    const clientError = new ClientError(
      ERROR_CODES.INITIALIZATION_ERROR,
      "Staking params not loaded",
    );
    logger?.warn(clientError.message);
    throw clientError;
  }
};
