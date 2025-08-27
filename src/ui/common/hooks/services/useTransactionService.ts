import { BabylonBtcStakingManager } from "@babylonlabs-io/btc-staking-ts";
import { Transaction } from "bitcoinjs-lib";
import { useCallback, useMemo } from "react";

import { useBTCWallet } from "@/ui/common/context/wallet/BTCWalletProvider";
import { useCosmosWallet } from "@/ui/common/context/wallet/CosmosWalletProvider";
import { ClientError, ERROR_CODES } from "@/ui/common/errors";
import { useLogger } from "@/ui/common/hooks/useLogger";
import { useAppState } from "@/ui/common/state";
import { validateStakingInput } from "@/ui/common/utils/delegations";
import { getFeeRateFromMempool } from "@/ui/common/utils/getFeeRateFromMempool";
import { getTxInfo, getTxMerkleProof } from "@/ui/common/utils/mempool_api";

import { useNetworkFees } from "../client/api/useNetworkFees";
import { useBbnQuery } from "../client/rpc/queries/useBbnQuery";

import { useStakingManagerService } from "./useStakingManagerService";

export interface BtcStakingInputs {
  finalityProviderPksNoCoordHex: string[];
  stakingAmountSat: number;
  stakingTimelock: number;
}

export interface BtcStakingExpansionInputs {
  finalityProviderPksNoCoordHex: string[];
  stakingAmountSat: number;
  stakingTimelock: number;
  previousStakingTxHex: string;
  previousStakingParamsVersion: number;
  previousStakingInput: BtcStakingInputs;
}

export const useTransactionService = () => {
  const {
    availableUTXOs,
    refetchUTXOs,
    isLoading: isUTXOsLoading,
  } = useAppState();

  const { data: networkFees } = useNetworkFees();
  const { defaultFeeRate } = getFeeRateFromMempool(networkFees);
  const {
    btcTipQuery: { data: tipHeader },
  } = useBbnQuery();

  const { bech32Address } = useCosmosWallet();
  const { publicKeyNoCoord, address: btcAddress, pushTx } = useBTCWallet();
  const logger = useLogger();

  const stakerInfo = useMemo(
    () => ({
      address: btcAddress,
      publicKeyNoCoordHex: publicKeyNoCoord,
    }),
    [btcAddress, publicKeyNoCoord],
  );

  const tipHeight = useMemo(() => tipHeader?.height ?? 0, [tipHeader]);

  const { createBtcStakingManager } = useStakingManagerService();

  /**
   * Create the delegation EOI
   *
   * @param stakingInput - The staking inputs
   * @param feeRate - The fee rate
   * @returns The staking transaction hash
   */
  const createDelegationEoi = useCallback(
    async (stakingInput: BtcStakingInputs, feeRate: number) => {
      const btcStakingManager = createBtcStakingManager();

      validateCommonInputs(
        btcStakingManager,
        stakingInput,
        tipHeight,
        stakerInfo,
      );

      if (!availableUTXOs) {
        const clientError = new ClientError(
          ERROR_CODES.INITIALIZATION_ERROR,
          "Available UTXOs not initialized",
        );
        logger.error(clientError);
        throw clientError;
      }

      const { stakingTx, signedBabylonTx } =
        await btcStakingManager!.preStakeRegistrationBabylonTransaction(
          stakerInfo,
          stakingInput,
          tipHeight,
          availableUTXOs,
          feeRate,
          bech32Address,
        );
      return {
        stakingTxHash: stakingTx.getId(),
        signedBabylonTx,
      };
    },
    [
      availableUTXOs,
      bech32Address,
      createBtcStakingManager,
      stakerInfo,
      tipHeight,
      logger,
    ],
  );

  /**
   * Estimate the staking fee
   *
   * @param stakingInput - The staking inputs
   * @param feeRate - The fee rate
   * @returns The staking fee
   */
  const estimateStakingFee = useCallback(
    (stakingInput: BtcStakingInputs, feeRate: number): number => {
      logger.info("Estimating staking fee", {
        feeRate,
      });
      const btcStakingManager = createBtcStakingManager();
      validateCommonInputs(
        btcStakingManager,
        stakingInput,
        tipHeight,
        stakerInfo,
      );
      if (!availableUTXOs) {
        const clientError = new ClientError(
          ERROR_CODES.INITIALIZATION_ERROR,
          "Available UTXOs not initialized",
        );
        logger.error(clientError);
        throw clientError;
      }
      const fee = btcStakingManager!.estimateBtcStakingFee(
        stakerInfo,
        tipHeight,
        stakingInput,
        availableUTXOs,
        feeRate,
      );
      return fee;
    },
    [createBtcStakingManager, tipHeight, stakerInfo, availableUTXOs, logger],
  );

  /**
   * Transition the delegation to phase 1
   *
   * @param stakingTxHex - The staking transaction hex
   * @param stakingHeight - The staking height of the phase-1 delegation
   * @param stakingInput - The staking inputs
   */
  const transitionPhase1Delegation = useCallback(
    async (
      stakingTxHex: string,
      stakingHeight: number,
      stakingInput: BtcStakingInputs,
    ) => {
      const btcStakingManager = createBtcStakingManager();
      validateCommonInputs(
        btcStakingManager,
        stakingInput,
        tipHeight,
        stakerInfo,
      );

      const stakingTx = Transaction.fromHex(stakingTxHex);
      const inclusionProof = await getInclusionProof(stakingTx);

      logger.info("Transitioning delegation", {
        stakingHeight,
        stakingTxId: stakingTx.getId(),
      });

      const { signedBabylonTx } =
        await btcStakingManager!.postStakeRegistrationBabylonTransaction(
          stakerInfo,
          stakingTx,
          stakingHeight,
          stakingInput,
          inclusionProof,
          bech32Address,
        );

      return {
        stakingTxHash: stakingTx.getId(),
        signedBabylonTx,
      };
    },
    [bech32Address, createBtcStakingManager, stakerInfo, tipHeight, logger],
  );

  /**
   * Submit the staking transaction
   *
   * @param stakingInput - The staking inputs
   * @param paramVersion - The param version
   * @param expectedTxHashHex - The expected transaction hash hex
   * @param stakingTxHex - The staking transaction hex
   */
  const submitStakingTx = useCallback(
    async (
      stakingInput: BtcStakingInputs,
      paramVersion: number,
      expectedTxHashHex: string,
      unsignedStakingTxHex: string,
    ) => {
      const btcStakingManager = createBtcStakingManager();
      validateCommonInputs(
        btcStakingManager,
        stakingInput,
        tipHeight,
        stakerInfo,
      );
      if (!availableUTXOs) {
        const clientError = new ClientError(
          ERROR_CODES.INITIALIZATION_ERROR,
          "Available UTXOs not initialized",
        );
        logger.error(clientError);
        throw clientError;
      }

      const unsignedStakingTx = Transaction.fromHex(unsignedStakingTxHex);

      const signedStakingTx =
        await btcStakingManager!.createSignedBtcStakingTransaction(
          stakerInfo,
          stakingInput,
          unsignedStakingTx,
          availableUTXOs,
          paramVersion,
        );

      if (signedStakingTx.getId() !== expectedTxHashHex) {
        const clientError = new ClientError(
          ERROR_CODES.VALIDATION_ERROR,
          `Staking transaction hash mismatch, expected ${expectedTxHashHex} but got ${signedStakingTx.getId()}`,
        );
        logger.error(clientError, {
          data: {
            expectedTxHashHex,
            unsignedStakingTxHex,
          },
        });
        throw clientError;
      }
      await pushTx(signedStakingTx.toHex());
      refetchUTXOs();
    },
    [
      availableUTXOs,
      createBtcStakingManager,
      pushTx,
      refetchUTXOs,
      stakerInfo,
      tipHeight,
      logger,
    ],
  );

  /**
   * Submit the unbonding transaction
   *
   * @param stakingInput - The staking inputs
   * @param paramVersion - The param version of the EOI
   * @param stakingTxHex - The staking transaction hex
   * @param unbondingTxHex - The unbonding transaction hex
   * @param covenantUnbondingSignatures - The covenant unbonding signatures
   */
  const submitUnbondingTx = useCallback(
    async (
      stakingInput: BtcStakingInputs,
      paramVersion: number,
      stakingTxHex: string,
      unbondingTxHex: string,
      covenantUnbondingSignatures: {
        btcPkHex: string;
        sigHex: string;
      }[],
    ) => {
      const btcStakingManager = createBtcStakingManager();
      validateCommonInputs(
        btcStakingManager,
        stakingInput,
        tipHeight,
        stakerInfo,
      );

      const unsignedUnbondingTx = Transaction.fromHex(unbondingTxHex);

      const { transaction: signedUnbondingTx } =
        await btcStakingManager!.createSignedBtcUnbondingTransaction(
          stakerInfo,
          stakingInput,
          paramVersion,
          Transaction.fromHex(stakingTxHex),
          unsignedUnbondingTx,
          covenantUnbondingSignatures,
        );

      await pushTx(signedUnbondingTx.toHex());
    },
    [createBtcStakingManager, pushTx, stakerInfo, tipHeight],
  );

  /**
   * Withdraw from the early unbonding transaction which is now unbonded
   *
   * @param stakingInput - The staking inputs
   * @param paramVersion - The param version of the EOI
   * @param earlyUnbondingTxHex - The early unbonding transaction hex
   */
  const submitEarlyUnbondedWithdrawalTx = useCallback(
    async (
      stakingInput: BtcStakingInputs,
      paramVersion: number,
      earlyUnbondingTxHex: string,
    ) => {
      logger.info("Executing submitEarlyUnbondedWithdrawalTx", {
        paramVersion,
        earlyUnbondingTxHex,
      });
      const btcStakingManager = createBtcStakingManager();
      validateCommonInputs(
        btcStakingManager,
        stakingInput,
        tipHeight,
        stakerInfo,
      );

      const { transaction: signedWithdrawalTx } =
        await btcStakingManager!.createSignedBtcWithdrawEarlyUnbondedTransaction(
          stakerInfo,
          stakingInput,
          paramVersion,
          Transaction.fromHex(earlyUnbondingTxHex),
          defaultFeeRate,
        );
      await pushTx(signedWithdrawalTx.toHex());
    },
    [
      createBtcStakingManager,
      defaultFeeRate,
      pushTx,
      stakerInfo,
      tipHeight,
      logger,
    ],
  );

  /**
   * Submit the timelock unbonded withdrawal transaction
   *
   * @param stakingInput - The staking inputs
   * @param paramVersion - The param version of the EOI
   * @param stakingTxHex - The staking transaction hex
   */
  const submitTimelockUnbondedWithdrawalTx = useCallback(
    async (
      stakingInput: BtcStakingInputs,
      paramVersion: number,
      stakingTxHex: string,
    ) => {
      logger.info("Executing submitTimelockUnbondedWithdrawalTx", {
        paramVersion,
        stakingTxHash: Transaction.fromHex(stakingTxHex).getId(),
      });
      const btcStakingManager = createBtcStakingManager();
      validateCommonInputs(
        btcStakingManager,
        stakingInput,
        tipHeight,
        stakerInfo,
      );

      const { transaction: signedWithdrawalTx } =
        await btcStakingManager!.createSignedBtcWithdrawStakingExpiredTransaction(
          stakerInfo,
          stakingInput,
          paramVersion,
          Transaction.fromHex(stakingTxHex),
          defaultFeeRate,
        );
      await pushTx(signedWithdrawalTx.toHex());
    },
    [
      createBtcStakingManager,
      defaultFeeRate,
      pushTx,
      stakerInfo,
      tipHeight,
      logger,
    ],
  );

  /**
   * Submit the withdrawal transaction for a slashed staking
   *
   * @param stakingInput - The staking inputs
   * @param paramVersion - The param version of the EOI
   * @param slashingTxHex - The slashing transaction hex that to be withdrawn
   */
  const submitSlashingWithdrawalTx = useCallback(
    async (
      stakingInput: BtcStakingInputs,
      paramVersion: number,
      slashingTxHex: string,
    ) => {
      const btcStakingManager = createBtcStakingManager();
      validateCommonInputs(
        btcStakingManager,
        stakingInput,
        tipHeight,
        stakerInfo,
      );

      const { transaction: signedWithdrawalTx } =
        await btcStakingManager!.createSignedBtcWithdrawSlashingTransaction(
          stakerInfo,
          stakingInput,
          paramVersion,
          Transaction.fromHex(slashingTxHex),
          defaultFeeRate,
        );
      await pushTx(signedWithdrawalTx.toHex());
    },
    [createBtcStakingManager, defaultFeeRate, pushTx, stakerInfo, tipHeight],
  );

  /**
   * Create the staking expansion EOI
   *
   * @param stakingExpansionInput - The staking expansion inputs
   * @param feeRate - The fee rate
   * @returns The expansion staking transaction hash and signed Babylon transaction
   */
  const createStakingExpansionEoi = useCallback(
    async (
      stakingExpansionInput: BtcStakingExpansionInputs,
      feeRate: number,
    ) => {
      const btcStakingManager = createBtcStakingManager();

      validateCommonInputs(
        btcStakingManager,
        {
          finalityProviderPksNoCoordHex:
            stakingExpansionInput.finalityProviderPksNoCoordHex,
          stakingAmountSat: stakingExpansionInput.stakingAmountSat,
          stakingTimelock: stakingExpansionInput.stakingTimelock,
        },
        tipHeight,
        stakerInfo,
      );

      if (isUTXOsLoading) {
        const clientError = new ClientError(
          ERROR_CODES.INITIALIZATION_ERROR,
          "Wallet UTXOs are still loading. Please wait a moment and try again.",
        );
        logger.error(clientError);
        throw clientError;
      }

      if (!availableUTXOs || availableUTXOs.length === 0) {
        const clientError = new ClientError(
          ERROR_CODES.INITIALIZATION_ERROR,
          "No available UTXOs found. Please ensure your wallet has sufficient funds.",
        );
        logger.error(clientError);
        throw clientError;
      }

      // Create previous staking transaction from hex
      const previousStakingTx = Transaction.fromHex(
        stakingExpansionInput.previousStakingTxHex,
      );

      const { stakingTx, signedBabylonTx } =
        await btcStakingManager!.stakingExpansionRegistrationBabylonTransaction(
          stakerInfo,
          stakingExpansionInput,
          tipHeight,
          availableUTXOs,
          feeRate,
          bech32Address,
          {
            stakingTx: previousStakingTx,
            paramVersion: stakingExpansionInput.previousStakingParamsVersion,
            stakingInput: stakingExpansionInput.previousStakingInput,
          },
        );

      return {
        stakingTxHash: stakingTx.getId(),
        signedBabylonTx,
      };
    },
    [
      availableUTXOs,
      bech32Address,
      createBtcStakingManager,
      stakerInfo,
      tipHeight,
      logger,
      isUTXOsLoading,
    ],
  );

  /**
   * Estimate the staking expansion fee
   *
   * @param stakingExpansionInput - The staking expansion inputs
   * @param feeRate - The fee rate
   * @returns The expansion staking fee
   */
  const estimateStakingExpansionFee = useCallback(
    (
      stakingExpansionInput: BtcStakingExpansionInputs,
      feeRate: number,
    ): number => {
      logger.info("Estimating staking expansion fee", {
        feeRate,
      });
      const btcStakingManager = createBtcStakingManager();
      validateCommonInputs(
        btcStakingManager,
        {
          finalityProviderPksNoCoordHex:
            stakingExpansionInput.finalityProviderPksNoCoordHex,
          stakingAmountSat: stakingExpansionInput.stakingAmountSat,
          stakingTimelock: stakingExpansionInput.stakingTimelock,
        },
        tipHeight,
        stakerInfo,
      );
      if (isUTXOsLoading) {
        const clientError = new ClientError(
          ERROR_CODES.INITIALIZATION_ERROR,
          "Wallet UTXOs are still loading. Please wait a moment and try again.",
        );
        logger.error(clientError);
        throw clientError;
      }

      if (!availableUTXOs || availableUTXOs.length === 0) {
        const clientError = new ClientError(
          ERROR_CODES.INITIALIZATION_ERROR,
          "No available UTXOs found. Please ensure your wallet has sufficient funds.",
        );
        logger.error(clientError);
        throw clientError;
      }

      // Create previous staking transaction from hex
      const previousStakingTx = Transaction.fromHex(
        stakingExpansionInput.previousStakingTxHex,
      );

      const fee = btcStakingManager!.estimateBtcStakingExpansionFee(
        stakerInfo,
        tipHeight,
        stakingExpansionInput,
        availableUTXOs,
        feeRate,
        {
          stakingTx: previousStakingTx,
          paramVersion: stakingExpansionInput.previousStakingParamsVersion,
          stakingInput: stakingExpansionInput.previousStakingInput,
        },
      );
      return fee;
    },
    [
      createBtcStakingManager,
      tipHeight,
      stakerInfo,
      availableUTXOs,
      logger,
      isUTXOsLoading,
    ],
  );

  /**
   * Submit the staking expansion transaction
   *
   * @param stakingExpansionInput - The staking expansion inputs
   * @param paramVersion - The param version
   * @param expectedTxHashHex - The expected transaction hash hex
   * @param unsignedStakingExpansionTxHex - The unsigned staking expansion transaction hex
   * @param covenantExpansionSignatures - The covenant expansion signatures
   */
  const submitStakingExpansionTx = useCallback(
    async (
      stakingExpansionInput: BtcStakingExpansionInputs,
      paramVersion: number,
      expectedTxHashHex: string,
      unsignedStakingExpansionTxHex: string,
      covenantExpansionSignatures: {
        btcPkHex: string;
        sigHex: string;
      }[],
    ) => {
      logger.info("Starting submitStakingExpansionTx", {
        expectedTxHashHex,
        unsignedTxHex: unsignedStakingExpansionTxHex.slice(0, 32) + "...",
        covenantSignaturesCount: covenantExpansionSignatures.length,
        paramVersion,
      });

      const btcStakingManager = createBtcStakingManager();
      validateCommonInputs(
        btcStakingManager,
        {
          finalityProviderPksNoCoordHex:
            stakingExpansionInput.finalityProviderPksNoCoordHex,
          stakingAmountSat: stakingExpansionInput.stakingAmountSat,
          stakingTimelock: stakingExpansionInput.stakingTimelock,
        },
        tipHeight,
        stakerInfo,
      );
      if (isUTXOsLoading) {
        const clientError = new ClientError(
          ERROR_CODES.INITIALIZATION_ERROR,
          "Wallet UTXOs are still loading. Please wait a moment and try again.",
        );
        logger.error(clientError);
        throw clientError;
      }

      if (!availableUTXOs || availableUTXOs.length === 0) {
        const clientError = new ClientError(
          ERROR_CODES.INITIALIZATION_ERROR,
          "No available UTXOs found. Please ensure your wallet has sufficient funds.",
        );
        logger.error(clientError);
        throw clientError;
      }

      // Parse transactions
      const unsignedStakingExpansionTx = Transaction.fromHex(
        unsignedStakingExpansionTxHex,
      );
      const previousStakingTx = Transaction.fromHex(
        stakingExpansionInput.previousStakingTxHex,
      );

      // Create signed transaction using btc-staking-ts
      const signedStakingExpansionTx =
        await btcStakingManager!.createSignedBtcStakingExpansionTransaction(
          stakerInfo,
          stakingExpansionInput,
          unsignedStakingExpansionTx,
          availableUTXOs,
          paramVersion,
          {
            stakingTx: previousStakingTx,
            paramVersion: stakingExpansionInput.previousStakingParamsVersion,
            stakingInput: stakingExpansionInput.previousStakingInput,
          },
          covenantExpansionSignatures,
        );

      const actualTxHashHex = signedStakingExpansionTx.getId();

      logger.info("Transaction signing completed", {
        expectedTxHashHex,
        actualTxHashHex,
        matches: actualTxHashHex === expectedTxHashHex,
      });

      // Verify the signed transaction hash matches the expected hash from API
      if (actualTxHashHex !== expectedTxHashHex) {
        const clientError = new ClientError(
          ERROR_CODES.VALIDATION_ERROR,
          `Staking expansion transaction hash mismatch, expected ${expectedTxHashHex} but got ${actualTxHashHex}`,
        );
        logger.error(clientError, {
          data: {
            expectedTxHashHex,
            actualTxHashHex,
            unsignedStakingExpansionTxHex:
              unsignedStakingExpansionTxHex.slice(0, 64) + "...",
            signedStakingExpansionTxHex:
              signedStakingExpansionTx.toHex().slice(0, 64) + "...",
            covenantSignaturesCount: covenantExpansionSignatures.length,
          },
        });
        throw clientError;
      }

      const logContext: Record<string, string> = {
        txHashHex: signedStakingExpansionTx.getId(),
      };

      if (stakingExpansionInput.previousStakingTxHex) {
        logContext.previousStakingTxHashHex = Transaction.fromHex(
          stakingExpansionInput.previousStakingTxHex,
        ).getId();
      }

      logger.info(
        "Broadcasting signed staking expansion transaction",
        logContext,
      );

      await pushTx(signedStakingExpansionTx.toHex());
      refetchUTXOs();
    },
    [
      availableUTXOs,
      createBtcStakingManager,
      pushTx,
      refetchUTXOs,
      stakerInfo,
      tipHeight,
      logger,
      isUTXOsLoading,
    ],
  );

  return {
    createDelegationEoi,
    estimateStakingFee,
    transitionPhase1Delegation,
    submitStakingTx,
    submitUnbondingTx,
    submitEarlyUnbondedWithdrawalTx,
    submitTimelockUnbondedWithdrawalTx,
    submitSlashingWithdrawalTx,
    createStakingExpansionEoi,
    estimateStakingExpansionFee,
    submitStakingExpansionTx,
    tipHeight,
  };
};

/**
 * Get the inclusion proof for a staking transaction
 * @param stakingTx - The staking transaction
 * @returns The inclusion proof
 */
const getInclusionProof = async (stakingTx: Transaction) => {
  // Get the merkle proof
  const { pos, merkle } = await getTxMerkleProof(stakingTx.getId());

  const {
    status: { blockHash: blockHashHex },
  } = await getTxInfo(stakingTx.getId());

  return {
    pos,
    merkle,
    blockHashHex,
  };
};

/**
 * Validate the common inputs
 * @param btcStakingManager - The BTC Staking Manager
 * @param stakingInput - The staking inputs (e.g. amount, timelock, etc.)
 * @param tipHeight - The BTC tip height from the Babylon Genesis
 * @param stakerInfo - The staker info (e.g. address, public key, etc.)
 */
const validateCommonInputs = (
  btcStakingManager: BabylonBtcStakingManager | null,
  stakingInput: BtcStakingInputs,
  tipHeight: number,
  stakerInfo: { address: string; publicKeyNoCoordHex: string },
) => {
  validateStakingInput(stakingInput);
  if (!btcStakingManager) {
    throw new ClientError(
      ERROR_CODES.INITIALIZATION_ERROR,
      "BTC Staking Manager not initialized",
    );
  }
  if (!tipHeight) {
    throw new ClientError(
      ERROR_CODES.INITIALIZATION_ERROR,
      "Tip height not initialized",
    );
  }
  if (!stakerInfo.address || !stakerInfo.publicKeyNoCoordHex) {
    throw new ClientError(
      ERROR_CODES.INITIALIZATION_ERROR,
      "Staker info not initialized",
    );
  }
};
