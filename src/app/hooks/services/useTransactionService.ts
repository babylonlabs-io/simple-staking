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

  const { signBbnTx, sendBbnTx } = useBbnTransaction();
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
    address,
    signMessage,
    network: btcNetwork,
    pushTx,
  } = useBTCWallet();

  const versionedParams = networkInfo?.params.bbnStakingParams?.versions;

  // Create the btc staking manager which is used to create the staking transaction
  const btcStakingManager = useMemo(() => {
    if (
      !btcNetwork ||
      !versionedParams ||
      !tipHeader ||
      !availableUTXOs ||
      !address ||
      !publicKeyNoCoord ||
      !cosmosConnected ||
      !bech32Address ||
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
      getStakerInfo: async () => ({
        address,
        publicKeyNoCoordHex: publicKeyNoCoord,
      }),
      getUTXOs: async () => availableUTXOs,
    };

    const bbnProvider = {
      getBabylonBtcTipHeight: async () => tipHeader.height,
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
    tipHeader,
    availableUTXOs,
    address,
    publicKeyNoCoord,
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
   * @param signingCallback - The signing callback
   * @returns The staking transaction hash
   */
  const createDelegationEoi = useCallback(
    async (stakingInput: BtcStakingInputs, feeRate: number) => {
      validateStakingInput(stakingInput);

      if (!btcStakingManager) {
        throw new Error("BTC Staking Manager not initialized");
      }

      const { stakingTx, signedBabylonTx } =
        await btcStakingManager.preStakeRegistrationBabylonTransaction(
          stakingInput,
          feeRate,
        );
      // Send the transaction
      await sendBbnTx(signedBabylonTx);

      return stakingTx.getId();
    },
    [btcStakingManager, sendBbnTx],
  );

  /**
   * Estimate the staking fee
   *
   * @param stakingInput - The staking inputs
   * @param feeRate - The fee rate
   * @returns The staking fee
   */
  const estimateStakingFee = useCallback(
    async (
      stakingInput: BtcStakingInputs,
      feeRate: number,
    ): Promise<number> => {
      validateStakingInput(stakingInput);

      if (!btcStakingManager) {
        throw new Error("BTC Staking Manager not initialized");
      }

      return btcStakingManager.estimateBtcStakingFee(stakingInput, feeRate);
    },
    [btcStakingManager],
  );

  /**
   * Transition the delegation to phase 1
   *
   * @param stakingTxHex - The staking transaction hex
   * @param stakingHeight - The staking height of the phase-1 delegation
   * @param stakingInput - The staking inputs
   * @param signingCallback - The signing callback
   */
  const transitionPhase1Delegation = useCallback(
    async (
      stakingTxHex: string,
      stakingHeight: number,
      stakingInput: BtcStakingInputs,
    ) => {
      if (!btcStakingManager) {
        throw new Error("BTC Staking Manager not initialized");
      }

      const stakingTx = Transaction.fromHex(stakingTxHex);
      const inclusionProof = await getInclusionProof(stakingTx);

      const { signedBabylonTx } =
        await btcStakingManager.postStakeRegistrationBabylonTransaction(
          stakingTx,
          stakingHeight,
          stakingInput,
          inclusionProof,
        );

      await sendBbnTx(signedBabylonTx);
    },
    [btcStakingManager, sendBbnTx],
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
      if (!btcStakingManager) {
        throw new Error("BTC Staking Manager not initialized");
      }

      const signedStakingTx =
        await btcStakingManager.createSignedBtcStakingTransaction(
          stakingInput,
          Transaction.fromHex(unsignedStakingTxHex),
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
    [btcStakingManager, pushTx, refetchUTXOs],
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
      validateStakingInput(stakingInput);

      if (!btcStakingManager) {
        throw new Error("BTC Staking Manager not initialized");
      }
      const unsignedUnbondingTx = Transaction.fromHex(unbondingTxHex);

      const { transaction: signedUnbondingTx } =
        await btcStakingManager.createSignedBtcUnbondingTransaction(
          stakingInput,
          paramVersion,
          Transaction.fromHex(stakingTxHex),
          unsignedUnbondingTx,
          covenantUnbondingSignatures,
        );

      await pushTx(signedUnbondingTx.toHex());
    },
    [btcStakingManager, pushTx],
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
      validateStakingInput(stakingInput);

      if (!btcStakingManager) {
        throw new Error("BTC Staking Manager not initialized");
      }

      const { transaction: signedWithdrawalTx } =
        await btcStakingManager.createSignedBtcWithdrawEarlyUnbondedTransaction(
          stakingInput,
          paramVersion,
          Transaction.fromHex(earlyUnbondingTxHex),
          defaultFeeRate,
        );
      await pushTx(signedWithdrawalTx.toHex());
    },
    [btcStakingManager, defaultFeeRate, pushTx],
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
      validateStakingInput(stakingInput);

      if (!btcStakingManager) {
        throw new Error("BTC Staking Manager not initialized");
      }

      const { transaction: signedWithdrawalTx } =
        await btcStakingManager.createSignedBtcWithdrawStakingExpiredTransaction(
          stakingInput,
          paramVersion,
          Transaction.fromHex(stakingTxHex),
          defaultFeeRate,
        );
      await pushTx(signedWithdrawalTx.toHex());
    },
    [btcStakingManager, defaultFeeRate, pushTx],
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
      validateStakingInput(stakingInput);

      if (!btcStakingManager) {
        throw new Error("BTC Staking Manager not initialized");
      }

      const { transaction: signedWithdrawalTx } =
        await btcStakingManager.createSignedBtcWithdrawSlashingTransaction(
          stakingInput,
          paramVersion,
          Transaction.fromHex(slashingTxHex),
          defaultFeeRate,
        );
      await pushTx(signedWithdrawalTx.toHex());
    },
    [btcStakingManager, defaultFeeRate, pushTx],
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
