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
      const previousTx = Transaction.fromHex(
        "0200000001c91ed7d1efcdd521f0a8860e8b180ef95f8d2f8f8a42fe88debd5b369072d4400000000000ffffffff0210270000000000002251201d800815bce2af09bbc2c26d2c65185903001f3a3e9d66f09868ad98140a7bb31e8c0000000000001600140a70b8068c6c24946a9e41c23e5bb4084f5266a000000000",
      );

      console.log("@@@@@@@ before signing");
      const { stakingTx, signedBabylonTx } =
        await btcStakingManager!.stakingExpansionRegistrationBabylonTransaction(
          stakerInfo,
          stakingInput,
          tipHeight,
          availableUTXOs,
          feeRate,
          bech32Address,
          {
            stakingTx: previousTx,
            paramVersion: 0,
            stakingInput: {
              finalityProviderPksNoCoordHex: [
                stakingInput.finalityProviderPksNoCoordHex[0],
              ],
              stakingAmountSat: stakingInput.stakingAmountSat,
              stakingTimelock: stakingInput.stakingTimelock,
            },
          },
        );
      console.log("@@@@@@@ after signing in registration");
      console.log("stakingTx", stakingTx);
      console.log("signedBabylonTx", signedBabylonTx);
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
  const submitStakingTx = useCallback(async () => {
    const btcStakingManager = createBtcStakingManager();
    const stakingInput = {
      finalityProviderPksNoCoordHex: [
        "2b48b92bb0191ffff18d7b339c079cf5863526b470ed847bcf5541dcfeacac5d",
        "87f6994f25863ebf0717d1b8a76fa26b3625f17bcbdf6b06c167ab1dfac534e7",
      ],
      stakingAmountSat: 10000,
      stakingTimelock: 60000,
    };

    const unsignedStakingTxHex =
      "0200000002774902425181ac1b061a439678bc26f1fabcdb9063ea61892ab5a6c2ef1d13af0000000000ffffffff51ee08e02031c57ff3ef7f6629d8737e1976e5ee5269d76734422977b4fd7e090100000000ffffffff02102700000000000022512088bf32b7573545b8cd7a6f58ddb46e28960e694de98896c8b62a075afe217baaa9030000000000001600140a70b8068c6c24946a9e41c23e5bb4084f5266a000000000";

    const unsignedStakingTx = Transaction.fromHex(unsignedStakingTxHex);
    console.log("unsignedStakingTx.getId()");
    console.log(unsignedStakingTx.getId());

    const previousTx = Transaction.fromHex(
      "0200000001c91ed7d1efcdd521f0a8860e8b180ef95f8d2f8f8a42fe88debd5b369072d4400000000000ffffffff0210270000000000002251201d800815bce2af09bbc2c26d2c65185903001f3a3e9d66f09868ad98140a7bb31e8c0000000000001600140a70b8068c6c24946a9e41c23e5bb4084f5266a000000000",
    );
    const signedStakingTx =
      await btcStakingManager!.createSignedBtcStakingExpansionTransaction(
        stakerInfo,
        stakingInput,
        unsignedStakingTx,
        availableUTXOs!,
        0,
        {
          stakingTx: previousTx,
          paramVersion: 0,
          stakingInput: {
            finalityProviderPksNoCoordHex: [
              "2b48b92bb0191ffff18d7b339c079cf5863526b470ed847bcf5541dcfeacac5d",
            ],
            stakingAmountSat: 10000,
            stakingTimelock: 60000,
          },
        },
        [
          {
            btcPkHex:
              "a5c60c2188e833d39d0fa798ab3f69aa12ed3dd2f3bad659effa252782de3c31",
            sigHex:
              "8a2c233c9c01c8a90e607e861b078eb8f13a9598637f1b7ab75797acf27e22391397738f3914968732324cd161e05c77b47d5d18991347c35ed027c6c0f5c57b",
          },
          {
            btcPkHex:
              "ffeaec52a9b407b355ef6967a7ffc15fd6c3fe07de2844d61550475e7a5233e5",
            sigHex:
              "61d250b7a60643fc9f49e76ff1004ac10ae075d5d11d83f8acfe1a82e8a6d29d1ee2959a9df6ad7bf2ed958f991a14d7063204ad9d106337b70a302c93719be1",
          },
          {
            btcPkHex:
              "59d3532148a597a2d05c0395bf5f7176044b1cd312f37701a9b4d0aad70bc5a4",
            sigHex:
              "23e03657e377d5a85bacd6e15e7ee18ee3ca03b6b68c590e6d0e3223acfe52ce99d391e51f70e5d444c3d5d9996d0d1427ab1bb4922cba5d4138d1033b982de2",
          },
        ],
      );
    console.log("signedStakingTx.getId()");
    console.log(signedStakingTx.getId());
    // if (signedStakingTx.getId() !== expectedTxHashHex) {
    //   const clientError = new ClientError(
    //     ERROR_CODES.VALIDATION_ERROR,
    //     `Staking transaction hash mismatch, expected ${expectedTxHashHex} but got ${signedStakingTx.getId()}`,
    //   );
    //   logger.error(clientError, {
    //     data: {
    //       expectedTxHashHex,
    //       unsignedStakingTxHex,
    //     },
    //   });
    //   throw clientError;
    // }
    await pushTx(signedStakingTx.toHex());
    refetchUTXOs();
  }, [
    availableUTXOs,
    createBtcStakingManager,
    pushTx,
    refetchUTXOs,
    stakerInfo,
  ]);

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

  return {
    createDelegationEoi,
    estimateStakingFee,
    transitionPhase1Delegation,
    submitStakingTx,
    submitUnbondingTx,
    submitEarlyUnbondedWithdrawalTx,
    submitTimelockUnbondedWithdrawalTx,
    submitSlashingWithdrawalTx,
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
