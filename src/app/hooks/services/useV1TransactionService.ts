import {
  BabylonBtcStakingManager,
  getStakerSignature,
  TransactionResult,
} from "@babylonlabs-io/btc-staking-ts";
import { Transaction } from "bitcoinjs-lib";
import { useCallback, useMemo } from "react";

import { getUnbondingEligibility } from "@/app/api/getUnbondingEligibility";
import { postUnbonding } from "@/app/api/postUnbonding";
import { ClientErrorCategory } from "@/app/constants/errorMessages";
import { ClientError } from "@/app/context/Error/errors";
import { useBTCWallet } from "@/app/context/wallet/BTCWalletProvider";
import { useCosmosWallet } from "@/app/context/wallet/CosmosWalletProvider";
import { useAppState } from "@/app/state";
import { ErrorType } from "@/app/types/errors";
import { validateStakingInput } from "@/utils/delegations";
import { txFeeSafetyCheck } from "@/utils/delegations/fee";
import { getFeeRateFromMempool } from "@/utils/getFeeRateFromMempool";
import { getBbnParamByBtcHeight } from "@/utils/params";

import { useNetworkFees } from "../client/api/useNetworkFees";
import { useBbnTransaction } from "../client/rpc/mutation/useBbnTransaction";

import { BtcStakingInputs } from "./useTransactionService";

export function useV1TransactionService() {
  const {
    connected: btcConnected,
    signPsbt,
    publicKeyNoCoord,
    address: btcAddress,
    network: btcNetwork,
    pushTx,
    signMessage,
  } = useBTCWallet();
  const { data: networkFees } = useNetworkFees();
  const { defaultFeeRate } = getFeeRateFromMempool(networkFees);
  const { networkInfo } = useAppState();

  const { signBbnTx } = useBbnTransaction();

  const { connected: cosmosConnected } = useCosmosWallet();
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
  // const bbnStakingParams = networkInfo?.params.bbnStakingParams.versions;
  const versionedParams = networkInfo?.params.bbnStakingParams?.versions;

  // TODO: Move below manager creation into a hook
  // Create the btc staking manager which is used to create the staking transaction
  const btcStakingManager = useMemo(() => {
    if (
      !btcNetwork ||
      !versionedParams ||
      !publicKeyNoCoord ||
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
    publicKeyNoCoord,
    cosmosConnected,
    btcConnected,
    signPsbt,
    signMessage,
    signBbnTx,
  ]);

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
      validateCommonInputs(btcStakingManager, stakingInput, stakerBtcInfo);

      const stakingTx = Transaction.fromHex(stakingTxHex);
      // Check if this staking transaction is eligible for unbonding
      const eligibility = await getUnbondingEligibility(stakingTx.getId());
      if (!eligibility) {
        throw new ClientError({
          message: "Transaction not eligible",
          category: ClientErrorCategory.CLIENT_TRANSACTION,
          type: ErrorType.UNBONDING,
        });
      }

      const { transaction: signedUnbondingTx } =
        await btcStakingManager!.createPartialSignedBtcUnbondingTransaction(
          stakerBtcInfo,
          stakingInput,
          stakingHeight,
          stakingTx,
        );
      const stakerSignatureHex = getStakerSignature(signedUnbondingTx);
      try {
        await postUnbonding(
          stakerSignatureHex,
          stakingTx.getId(),
          signedUnbondingTx.getId(),
          signedUnbondingTx.toHex(),
        );
      } catch (error) {
        throw new Error(`Error submitting unbonding transaction: ${error}`);
      }
    },
    [btcStakingManager, stakerBtcInfo],
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
      validateCommonInputs(btcStakingManager, stakingInput, stakerBtcInfo);
      if (!versionedParams?.length) {
        throw new Error("Staking params not loaded");
      }
      // Get the param version based on height
      const { version: paramVersion } = getBbnParamByBtcHeight(
        stakingHeight,
        versionedParams,
      );

      validateStakingInput(stakingInput);
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
    [btcStakingManager, defaultFeeRate, pushTx, stakerBtcInfo, versionedParams],
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
) => {
  validateStakingInput(stakingInput);
  if (!btcStakingManager) {
    throw new Error("BTC Staking Manager not initialized");
  }
  if (!stakerBtcInfo.address || !stakerBtcInfo.publicKeyNoCoordHex) {
    throw new Error("Staker info not initialized");
  }
};
