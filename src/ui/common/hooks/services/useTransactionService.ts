import { BabylonBtcStakingManager, UTXO } from "@babylonlabs-io/btc-staking-ts";
import { Transaction } from "bitcoinjs-lib";
import { useCallback, useMemo } from "react";

import { useBTCWallet } from "@/ui/common/context/wallet/BTCWalletProvider";
import { useCosmosWallet } from "@/ui/common/context/wallet/CosmosWalletProvider";
import { ClientError, ERROR_CODES } from "@/ui/common/errors";
import { useLogger } from "@/ui/common/hooks/useLogger";
import { useAppState } from "@/ui/common/state";
import { validateStakingInput } from "@/ui/common/utils/delegations";
import { getFeeRateFromMempool } from "@/ui/common/utils/getFeeRateFromMempool";
import {
  getTxHex,
  getTxInfo,
  getTxMerkleProof,
} from "@/ui/common/utils/mempool_api";

import { useNetworkFees } from "../client/api/useNetworkFees";
import { useBbnQuery } from "../client/rpc/queries/useBbnQuery";

import { useStakingManagerService } from "./useStakingManagerService";

export interface BtcStakingInputs {
  finalityProviderPksNoCoordHex: string[];
  stakingAmountSat: number;
  stakingTimelock: number;
}

export interface StakingExpansionInputs {
  finalityProviderPksNoCoordHex: string[];
  stakingAmountSat: number;
  stakingTimelock: number;
  previousStakingTxHash: string;
  fundingTx: Uint8Array;
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
   * Create a UTXO object from a transaction hash
   *
   * @param txHash - The transaction hash
   * @param outputIndex - The output index (vout)
   * @returns The UTXO object
   */
  const createUtxoFromTxHash = async (
    txHash: string,
    outputIndex: number,
  ): Promise<UTXO> => {
    try {
      const txHex = await getTxHex(txHash);
      const tx = Transaction.fromHex(txHex);
      const output = tx.outs[outputIndex];

      if (!output) {
        console.error("❌ [UTXO DEBUG] Output not found:", {
          txHash,
          outputIndex,
          availableOutputs: tx.outs.length,
        });
        throw new Error(
          `Output ${outputIndex} not found in transaction ${txHash}`,
        );
      }

      const utxo = {
        txid: txHash,
        vout: outputIndex,
        value: output.value,
        scriptPubKey: output.script.toString("hex"),
        rawTxHex: txHex,
      };

      return utxo;
    } catch (error) {
      console.error("❌ [UTXO DEBUG] Error in createUtxoFromTxHash:", {
        txHash,
        outputIndex,
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });
      throw new ClientError(
        ERROR_CODES.EXTERNAL_SERVICE_UNAVAILABLE,
        `Failed to create UTXO from transaction hash: ${txHash}`,
        { cause: error as Error },
      );
    }
  };

  /**
   * Find the funding UTXO from available UTXOs that matches the funding transaction
   *
   * @param availableUTXOs - Array of available UTXOs
   * @param fundingTx - The funding transaction bytes
   * @returns The matching UTXO or null if not found
   */
  const findFundingUtxo = (
    availableUTXOs: UTXO[],
    fundingTx: Uint8Array,
  ): UTXO | null => {
    try {
      // Convert Uint8Array to Buffer for bitcoinjs-lib
      const buffer = Buffer.from(fundingTx);

      // Parse the funding transaction
      const tx = Transaction.fromBuffer(buffer);
      const fundingTxId = tx.getId();

      // Find UTXO that matches any output of the funding transaction
      for (let vout = 0; vout < tx.outs.length; vout++) {
        const matchingUtxo = availableUTXOs.find(
          (utxo) => utxo.txid === fundingTxId && utxo.vout === vout,
        );
        if (matchingUtxo) {
          return matchingUtxo;
        }
      }

      return null;
    } catch (error) {
      return null;
    }
  };

  /**
   * Create a BTC stake expansion transaction
   *
   * @param expansionInput - The expansion inputs
   * @param feeRate - The fee rate
   * @returns The expansion transaction result
   */
  const createStakeExpansionTransaction = useCallback(
    async (expansionInput: StakingExpansionInputs, feeRate: number) => {
      const btcStakingManager = createBtcStakingManager();

      validateCommonInputs(
        btcStakingManager,
        expansionInput,
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

      // Create UTXO from previous staking transaction for the first input
      const previousStakingUtxo = await createUtxoFromTxHash(
        expansionInput.previousStakingTxHash,
        0, // Assuming staking output is at index 0
      );
      // Find funding UTXO from available UTXOs based on the funding transaction
      const fundingUtxo = findFundingUtxo(
        availableUTXOs,
        expansionInput.fundingTx,
      );

      if (!fundingUtxo) {
        console.error("=== FAILED to find matching funding UTXO ===");
        console.error("fundingTx length:", expansionInput.fundingTx.length);
        console.error("availableUTXOs count:", availableUTXOs.length);
        console.error(
          "availableUTXO txids:",
          availableUTXOs.map((u) => u.txid),
        );
        const clientError = new ClientError(
          ERROR_CODES.VALIDATION_ERROR,
          "Could not find matching funding UTXO in available UTXOs",
        );
        logger.error(clientError);
        throw clientError;
      }

      // Create the 2-input UTXO array: previous staking + funding
      const expansionInputUtxos = [previousStakingUtxo, fundingUtxo];

      const result = await (
        btcStakingManager as any
      ).createBtcStakeExpansionTransaction(
        stakerInfo,
        expansionInput,
        tipHeight,
        expansionInputUtxos,
        feeRate,
        bech32Address,
      );

      return result;
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
   * Estimate the expansion fee
   *
   * @param expansionInput - The expansion inputs
   * @param feeRate - The fee rate
   * @returns The expansion fee
   */
  const estimateExpansionFee = useCallback(
    (expansionInput: StakingExpansionInputs, feeRate: number): number => {
      logger.info("Estimating expansion fee", {
        feeRate,
        previousStakingTxHash: expansionInput.previousStakingTxHash,
      });
      const btcStakingManager = createBtcStakingManager();
      validateCommonInputs(
        btcStakingManager,
        expansionInput,
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

      // Note: The btc-staking-ts library may need to add this method
      // For now, we'll use the regular staking fee estimation as a fallback
      const fee = btcStakingManager!.estimateBtcStakingFee(
        stakerInfo,
        tipHeight,
        expansionInput,
        availableUTXOs,
        feeRate,
      );
      return fee;
    },
    [createBtcStakingManager, tipHeight, stakerInfo, availableUTXOs, logger],
  );

  /**
   * Submit the expansion staking transaction
   *
   * @param stakingInput - The staking inputs
   * @param paramVersion - The param version
   * @param expectedTxHashHex - The expected transaction hash hex
   * @param unsignedStakingTxHex - The unsigned staking transaction hex
   * @param previousStakingTxHash - The previous staking transaction hash
   * @param fundingTx - The funding transaction bytes
   */
  const submitExpansionStakingTx = useCallback(
    async (
      stakingInput: BtcStakingInputs,
      paramVersion: number,
      expectedTxHashHex: string,
      unsignedStakingTxHex: string,
      previousStakingTxHash: string,
      fundingTx: Uint8Array,
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
      // Create UTXO from previous staking transaction
      const previousStakingUtxo = await createUtxoFromTxHash(
        previousStakingTxHash,
        0, // Assuming staking output is at index 0
      );
      // Find funding UTXO from available UTXOs
      const fundingUtxo = findFundingUtxo(availableUTXOs, fundingTx);
      if (!fundingUtxo) {
        console.error("❌ [EXPANSION DEBUG] Could not find funding UTXO");
        const clientError = new ClientError(
          ERROR_CODES.VALIDATION_ERROR,
          "Could not find matching funding UTXO in available UTXOs",
        );
        logger.error(clientError);
        throw clientError;
      }
      // Create the combined UTXO array for signing
      const expansionInputUtxos = [previousStakingUtxo, fundingUtxo];
      // CRITICAL: Reorder UTXOs to match the unsigned transaction input order
      // Get transaction input order
      const transactionInputs = unsignedStakingTx.ins.map((input, index) => ({
        index,
        txid: Buffer.from(input.hash).reverse().toString("hex"),
        vout: input.index,
      }));

      // Reorder UTXO array to match transaction input order
      const reorderedUtxos: UTXO[] = [];
      for (const txInput of transactionInputs) {
        const matchingUtxo = expansionInputUtxos.find(
          (utxo) => utxo.txid === txInput.txid && utxo.vout === txInput.vout,
        );

        if (!matchingUtxo) {
          console.error(
            "❌ [EXPANSION DEBUG] No UTXO found for transaction input:",
            txInput,
          );
          throw new ClientError(
            ERROR_CODES.VALIDATION_ERROR,
            `No UTXO found for transaction input ${txInput.txid}:${txInput.vout}`,
          );
        }

        reorderedUtxos.push(matchingUtxo);
      }

      try {
        const signedStakingTx =
          await btcStakingManager!.createSignedBtcStakingTransaction(
            stakerInfo,
            stakingInput,
            unsignedStakingTx,
            reorderedUtxos, // Use the reordered UTXO array to match transaction input order
            paramVersion,
          );

        if (signedStakingTx.getId() !== expectedTxHashHex) {
          console.error("❌ [EXPANSION DEBUG] Transaction hash mismatch!");
          const clientError = new ClientError(
            ERROR_CODES.VALIDATION_ERROR,
            `Expansion transaction hash mismatch, expected ${expectedTxHashHex} but got ${signedStakingTx.getId()}`,
          );
          logger.error(clientError);
          throw clientError;
        }

        await pushTx(signedStakingTx.toHex());
        refetchUTXOs();
      } catch (error) {
        console.error(
          "❌ [EXPANSION DEBUG] Error during transaction signing:",
          {
            error: error instanceof Error ? error.message : String(error),
            stack: error instanceof Error ? error.stack : undefined,
            stakerInfo,
            stakingInput,
            originalUtxos: expansionInputUtxos.map((u) => ({
              txid: u.txid,
              vout: u.vout,
              value: u.value,
              scriptPubKey: u.scriptPubKey?.toString(),
            })),
            reorderedUtxos: reorderedUtxos.map((u) => ({
              txid: u.txid,
              vout: u.vout,
              value: u.value,
              scriptPubKey: u.scriptPubKey?.toString(),
            })),
          },
        );
        throw error;
      }
    },
    [
      availableUTXOs,
      createBtcStakingManager,
      pushTx,
      refetchUTXOs,
      stakerInfo,
      tipHeight,
      logger,
      createUtxoFromTxHash,
      findFundingUtxo,
    ],
  );

  /**
   * Submit the expansion staking transaction with covenant signatures
   *
   * @param expansionInput - The expansion staking inputs
   * @param paramVersion - The param version
   * @param expectedTxHashHex - The expected transaction hash hex
   * @param unsignedStakingTxHex - The unsigned staking transaction hex
   * @param previousStakingTxHash - The previous staking transaction hash
   * @param fundingTx - The funding transaction bytes
   * @param covenantExpansionSignatures - The covenant signatures for the previous staking UTXO
   */
  const submitExpansionStakingTxWithCovenantSignatures = useCallback(
    async (
      expansionInput: BtcStakingInputs,
      paramVersion: number,
      expectedTxHashHex: string, // TODO not used right now
      unsignedStakingTxHex: string,
      previousStakingTxHash: string,
      fundingTx: Uint8Array,
      covenantExpansionSignatures: {
        btcPkHex: string;
        sigHex: string;
      }[],
    ) => {
      const btcStakingManager = createBtcStakingManager();
      validateCommonInputs(
        btcStakingManager,
        expansionInput,
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

      // Create UTXO from previous staking transaction
      const previousStakingUtxo = await createUtxoFromTxHash(
        previousStakingTxHash,
        0, // Assuming staking output is at index 0
      );

      // Find funding UTXO from available UTXOs
      const fundingUtxo = findFundingUtxo(availableUTXOs, fundingTx);

      if (!fundingUtxo) {
        const clientError = new ClientError(
          ERROR_CODES.VALIDATION_ERROR,
          "Could not find matching funding UTXO in available UTXOs",
        );
        logger.error(clientError);
        throw clientError;
      }

      // Create the combined UTXO array for signing
      const expansionInputUtxos = [previousStakingUtxo, fundingUtxo];

      // Reorder UTXOs to match the unsigned transaction input order
      const transactionInputs = unsignedStakingTx.ins.map((input, index) => ({
        index,
        txid: Buffer.from(input.hash).reverse().toString("hex"),
        vout: input.index,
      }));

      const reorderedUtxos: UTXO[] = [];
      for (const txInput of transactionInputs) {
        const matchingUtxo = expansionInputUtxos.find(
          (utxo) => utxo.txid === txInput.txid && utxo.vout === txInput.vout,
        );

        if (!matchingUtxo) {
          throw new ClientError(
            ERROR_CODES.VALIDATION_ERROR,
            `No UTXO found for transaction input ${txInput.txid}:${txInput.vout}`,
          );
        }

        reorderedUtxos.push(matchingUtxo);
      }

      // Sign the expansion transaction with covenant signatures
      const signedExpansionTx =
        await btcStakingManager!.createSignedBtcStakingExpansionTransaction(
          stakerInfo,
          expansionInput,
          unsignedStakingTx,
          reorderedUtxos,
          paramVersion,
          covenantExpansionSignatures,
        );

      console.log("signedExpansionTx", signedExpansionTx);
      console.log("signedExpansionTx.toHex()", signedExpansionTx.toHex());

      await pushTx(signedExpansionTx.toHex());
    },
    [
      availableUTXOs,
      createBtcStakingManager,
      createUtxoFromTxHash,
      findFundingUtxo,
      pushTx,
      stakerInfo,
      tipHeight,
      logger,
    ],
  );

  return {
    createDelegationEoi,
    estimateStakingFee,
    transitionPhase1Delegation,
    submitStakingTx,
    submitExpansionStakingTx,
    submitExpansionStakingTxWithCovenantSignatures,
    submitUnbondingTx,
    submitEarlyUnbondedWithdrawalTx,
    submitTimelockUnbondedWithdrawalTx,
    submitSlashingWithdrawalTx,
    createStakeExpansionTransaction,
    estimateExpansionFee,
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
