import {
  BabylonBtcStakingManager,
  SigningType,
  StakingEventType,
} from "@babylonlabs-io/btc-staking-ts";
import { Transaction } from "bitcoinjs-lib";
import { useCallback, useMemo } from "react";

import { ClientErrorCategory } from "@/app/constants/errorMessages";
import { ClientError } from "@/app/context/Error/errors";
import { useBTCWallet } from "@/app/context/wallet/BTCWalletProvider";
import { useCosmosWallet } from "@/app/context/wallet/CosmosWalletProvider";
import { useAppState } from "@/app/state";
import { ErrorType } from "@/app/types/errors";
import { validateStakingInput } from "@/utils/delegations";
import { getFeeRateFromMempool } from "@/utils/getFeeRateFromMempool";
import { getTxInfo, getTxMerkleProof } from "@/utils/mempool_api";

import { useNetworkFees } from "../client/api/useNetworkFees";
import { useBbnTransaction } from "../client/rpc/mutation/useBbnTransaction";
import { useBbnQuery } from "../client/rpc/queries/useBbnQuery";

export interface BtcStakingInputs {
  finalityProviderPkNoCoordHex: string;
  stakingAmountSat: number;
  stakingTimelock: number;
}

export const useTransactionService = () => {
  const { availableUTXOs, networkInfo, refetchUTXOs } = useAppState();

  const { signBbnTx } = useBbnTransaction();
  const { data: networkFees } = useNetworkFees();
  const { defaultFeeRate } = getFeeRateFromMempool(networkFees);
  const {
    btcTipQuery: { data: tipHeader },
  } = useBbnQuery();

  const { connected: cosmosConnected, bech32Address } = useCosmosWallet();
  const {
    connected: btcConnected,
    signPsbt,
    publicKeyNoCoord,
    address: btcAddress,
    signMessage,
    network: btcNetwork,
    pushTx,
  } = useBTCWallet();

  const versionedParams = networkInfo?.params.bbnStakingParams?.versions;

  const stakerInfo = useMemo(
    () => ({
      address: btcAddress,
      publicKeyNoCoordHex: publicKeyNoCoord,
    }),
    [btcAddress, publicKeyNoCoord],
  );

  const tipHeight = useMemo(() => tipHeader?.height ?? 0, [tipHeader]);

  // TODO: Move below manager creation into a hook
  // Create the btc staking manager which is used to create the staking transaction
  const btcStakingManager = useMemo(() => {
    if (
      !btcNetwork ||
      !versionedParams ||
      !cosmosConnected ||
      !btcConnected ||
      !signPsbt ||
      !signMessage ||
      !signBbnTx
    ) {
      return null;
    }

    const btcProvider = {
      signPsbt,
      signMessage,
    };

    const bbnProvider = {
      getBabylonAddress: async () => bech32Address,
      signTransaction: async <T extends object>(msg: {
        typeUrl: string;
        value: T;
      }) => signBbnTx(msg),
    };

    return new BabylonBtcStakingManager(
      btcNetwork,
      versionedParams,
      btcProvider,
      bbnProvider,
    );
  }, [
    btcNetwork,
    versionedParams,
    cosmosConnected,
    bech32Address,
    btcConnected,
    signPsbt,
    signMessage,
    signBbnTx,
  ]);

  /**
   * Create the delegation EOI
   *
   * @param stakingInput - The staking inputs
   * @param feeRate - The fee rate
   * @returns The staking transaction hash
   */
  const createDelegationEoi = useCallback(
    async (stakingInput: BtcStakingInputs, feeRate: number) => {
      validateCommonInputs(
        btcStakingManager,
        stakingInput,
        tipHeight,
        stakerInfo,
      );

      if (!availableUTXOs) {
        throw new Error("Available UTXOs not initialized");
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
    [availableUTXOs, bech32Address, btcStakingManager, stakerInfo, tipHeight],
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
      validateCommonInputs(
        btcStakingManager,
        stakingInput,
        tipHeight,
        stakerInfo,
      );
      if (!availableUTXOs) {
        throw new Error("Available UTXOs not initialized");
      }
      return btcStakingManager!.estimateBtcStakingFee(
        stakerInfo,
        tipHeight,
        stakingInput,
        availableUTXOs,
        feeRate,
      );
    },
    [btcStakingManager, tipHeight, stakerInfo, availableUTXOs],
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

      return {
        stakingTxHash: stakingTx.getId(),
        signedBabylonTx,
      };
    },
    [bech32Address, btcStakingManager, stakerInfo, tipHeight],
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
      validateCommonInputs(
        btcStakingManager,
        stakingInput,
        tipHeight,
        stakerInfo,
      );
      if (!availableUTXOs) {
        throw new Error("Available UTXOs not initialized");
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
        throw new ClientError({
          message: `Staking transaction hash mismatch, expected ${expectedTxHashHex} but got ${signedStakingTx.getId()}`,
          category: ClientErrorCategory.CLIENT_TRANSACTION,
          type: ErrorType.STAKING,
        });
      }
      await pushTx(signedStakingTx.toHex());
      refetchUTXOs();
    },
    [
      availableUTXOs,
      btcStakingManager,
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
    [btcStakingManager, pushTx, stakerInfo, tipHeight],
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
    [btcStakingManager, defaultFeeRate, pushTx, stakerInfo, tipHeight],
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
    [btcStakingManager, defaultFeeRate, pushTx, stakerInfo, tipHeight],
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
    [btcStakingManager, defaultFeeRate, pushTx, stakerInfo, tipHeight],
  );

  /**
   * Subscribe to signing step events
   * @param callback - The callback to be called when a signing step event occurs
   * @returns A cleanup function to remove the listener
   */
  const subscribeToSigningSteps = useCallback(
    (callback: (step: SigningType) => void) => {
      if (!btcStakingManager) {
        return () => {};
      }

      btcStakingManager.on(StakingEventType.SIGNING, callback);

      // Return cleanup function
      return () => {
        btcStakingManager.off(StakingEventType.SIGNING, callback);
      };
    },
    [btcStakingManager],
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
 * @param tipHeight - The BTC tip height from the Babylon chain
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
    throw new Error("BTC Staking Manager not initialized");
  }
  if (!tipHeight) {
    throw new Error("Tip height not initialized");
  }
  if (!stakerInfo.address || !stakerInfo.publicKeyNoCoordHex) {
    throw new Error("Staker info not initialized");
  }
};
