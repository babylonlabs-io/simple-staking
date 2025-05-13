import {
  BabylonBtcStakingManager,
  SigningStep,
} from "@babylonlabs-io/btc-staking-ts";
import { Transaction } from "bitcoinjs-lib";
import { useCallback, useMemo } from "react";

import { useBTCWallet } from "@/app/context/wallet/BTCWalletProvider";
import { useCosmosWallet } from "@/app/context/wallet/CosmosWalletProvider";
import { useAppState } from "@/app/state";
import { ClientError, ERROR_CODES } from "@/errors";
import { useLogger } from "@/hooks/useLogger";
import { validateStakingInput } from "@/utils/delegations";
import { getFeeRateFromMempool } from "@/utils/getFeeRateFromMempool";
import { getTxInfo, getTxMerkleProof } from "@/utils/mempool_api";

import { useNetworkFees } from "../client/api/useNetworkFees";
import { useBbnQuery } from "../client/rpc/queries/useBbnQuery";

import { useStakingManagerService } from "./useStakingManagerService";

export interface BtcStakingInputs {
  finalityProviderPkNoCoordHex: string;
  stakingAmountSat: number;
  stakingTimelock: number;
}

export const useTransactionService = () => {
  const { availableUTXOs, refetchUTXOs } = useAppState();

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

  const {
    createBtcStakingManager,
    on: managerEventsOn,
    off: managerEventsOff,
  } = useStakingManagerService();

  /**
   * Create the delegation EOI
   *
   * @param stakingInput - The staking inputs
   * @param feeRate - The fee rate
   * @returns The staking transaction hash
   */
  const createDelegationEoi = useCallback(
    async (stakingInput: BtcStakingInputs, feeRate: number) => {
      logger.info("Creating delegation EOI", {
        stakingInput: JSON.stringify(stakingInput),
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
        logger.error(clientError, {
          tags: {
            errorCode: clientError.errorCode,
            errorSource: "useTransactionService:createDelegationEoi",
          },
        });
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
      logger.info("Delegation EOI created successfully", {
        stakingTxHash: stakingTx.getId(),
      });
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
        stakingInput: JSON.stringify(stakingInput),
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
        logger.error(clientError, {
          tags: {
            errorCode: clientError.errorCode,
            errorSource: "useTransactionService:estimateStakingFee",
          },
        });
        throw clientError;
      }
      const fee = btcStakingManager!.estimateBtcStakingFee(
        stakerInfo,
        tipHeight,
        stakingInput,
        availableUTXOs,
        feeRate,
      );
      logger.info("Staking fee estimated", { fee });
      return fee;
    },
    [createBtcStakingManager, tipHeight, stakerInfo, availableUTXOs],
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
      logger.info("Transitioning delegation to phase 1", {
        stakingHeight,
        stakingInput: JSON.stringify(stakingInput),
      });
      const btcStakingManager = createBtcStakingManager();
      validateCommonInputs(
        btcStakingManager,
        stakingInput,
        tipHeight,
        stakerInfo,
      );

      const stakingTx = Transaction.fromHex(stakingTxHex);
      const inclusionProof = await getInclusionProof(stakingTx);

      const { signedBabylonTx } =
        await btcStakingManager!.postStakeRegistrationBabylonTransaction(
          stakerInfo,
          stakingTx,
          stakingHeight,
          stakingInput,
          inclusionProof,
          bech32Address,
        );

      logger.info("Delegation transitioned to phase 1 successfully", {
        stakingTxHash: stakingTx.getId(),
      });
      return {
        stakingTxHash: stakingTx.getId(),
        signedBabylonTx,
      };
    },
    [bech32Address, createBtcStakingManager, stakerInfo, tipHeight],
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
      logger.info("Submitting staking transaction", {
        paramVersion,
        expectedTxHashHex,
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
        logger.error(clientError, {
          tags: {
            errorCode: clientError.errorCode,
            errorSource: "useTransactionService:submitStakingTx",
          },
        });
        throw clientError;
      }

      const signedStakingTx =
        await btcStakingManager!.createSignedBtcStakingTransaction(
          stakerInfo,
          stakingInput,
          Transaction.fromHex(unsignedStakingTxHex),
          availableUTXOs,
          paramVersion,
        );

      if (signedStakingTx.getId() !== expectedTxHashHex) {
        logger.info("Staking transaction hash mismatch", {
          expectedTxHashHex,
          actualTxHash: signedStakingTx.getId(),
        });
        const clientError = new ClientError(
          ERROR_CODES.VALIDATION_ERROR,
          `Staking transaction hash mismatch, expected ${expectedTxHashHex} but got ${signedStakingTx.getId()}`,
        );
        logger.error(clientError, {
          tags: {
            errorCode: clientError.errorCode,
            errorSource: "useTransactionService:submitStakingTx",
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
    [createBtcStakingManager, defaultFeeRate, pushTx, stakerInfo, tipHeight],
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
    [createBtcStakingManager, defaultFeeRate, pushTx, stakerInfo, tipHeight],
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
   * Subscribe to signing step events
   * @param callback - The callback to be called when a signing step event occurs
   * @returns A cleanup function to remove the listener
   */
  const subscribeToSigningSteps = useCallback(
    (callback: (step: SigningStep) => void) => {
      managerEventsOn(callback);

      // Return cleanup function
      return () => {
        managerEventsOff(callback);
      };
    },
    [managerEventsOff, managerEventsOn],
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
    subscribeToSigningSteps,
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
