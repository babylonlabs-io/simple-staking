import { PsbtResult, Staking } from "@babylonlabs-io/btc-staking-ts";
import { Psbt, Transaction } from "bitcoinjs-lib";
import { useCallback } from "react";

import { getUnbondingEligibility } from "@/app/api/getUnbondingEligibility";
import { postUnbonding } from "@/app/api/postUnbonding";
import { ClientErrorCategory } from "@/app/constants/errorMessages";
import { ClientError } from "@/app/context/Error/errors";
import { useBTCWallet } from "@/app/context/wallet/BTCWalletProvider";
import { useAppState } from "@/app/state";
import { ErrorState } from "@/app/types/errors";
import { validateStakingInput } from "@/utils/delegations";
import { txFeeSafetyCheck } from "@/utils/delegations/fee";
import { getFeeRateFromMempool } from "@/utils/getFeeRateFromMempool";
import { getBbnParamByBtcHeight } from "@/utils/params";

import { useNetworkFees } from "../client/api/useNetworkFees";

import { BtcStakingInputs } from "./useTransactionService";

export function useV1TransactionService() {
  const {
    connected: btcConnected,
    signPsbt,
    publicKeyNoCoord,
    address,
    network: btcNetwork,
    pushTx,
  } = useBTCWallet();
  const { data: networkFees } = useNetworkFees();
  const { defaultFeeRate } = getFeeRateFromMempool(networkFees);
  const { networkInfo } = useAppState();

  // We use phase-2 parameters instead of legacy global parameters.
  // Phase-2 BBN parameters include all phase-1 global parameters,
  // except for the "tag" field which is only used for staking transactions.
  // The "tag" is not needed for withdrawal or unbonding transactions.
  const bbnStakingParams = networkInfo?.params.bbnStakingParams.versions;

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
      // Perform checks
      if (!bbnStakingParams) {
        throw new ClientError({
          message: "Staking params not loaded",
          category: ClientErrorCategory.CLIENT_VALIDATION,
          state: ErrorState.STAKING,
        });
      }
      if (!btcConnected || !btcNetwork)
        throw new Error("BTC Wallet not connected");
      validateStakingInput(stakingInput);

      // Get the staking params at the time of the staking transaction
      const stakingParam = getBbnParamByBtcHeight(
        stakingHeight,
        bbnStakingParams,
      );

      if (!stakingParam) {
        throw new ClientError({
          message: `Params for height ${stakingHeight} not found`,
          category: ClientErrorCategory.CLIENT_VALIDATION,
          state: ErrorState.TRANSITION,
        });
      }

      // Warning: We using the "Staking" instead of "ObservableStaking"
      // because unbonding transactions does not require phase-1 specific tags
      const staking = new Staking(
        btcNetwork!,
        {
          address,
          publicKeyNoCoordHex: publicKeyNoCoord,
        },
        stakingParam,
        stakingInput.finalityProviderPkNoCoordHex,
        stakingInput.stakingTimelock,
      );

      const stakingTx = Transaction.fromHex(stakingTxHex);

      // Check if this staking transaction is eligible for unbonding
      const eligibility = await getUnbondingEligibility(stakingTx.getId());
      if (!eligibility) {
        throw new ClientError({
          message: "Transaction not eligible",
          category: ClientErrorCategory.CLIENT_VALIDATION,
          state: ErrorState.UNBONDING,
        });
      }

      const txResult = staking.createUnbondingTransaction(stakingTx);

      const psbt = staking.toUnbondingPsbt(txResult.transaction, stakingTx);

      const signedUnbondingPsbtHex = await signPsbt(psbt.toHex());
      const signedUnbondingTx = Psbt.fromHex(
        signedUnbondingPsbtHex,
      ).extractTransaction();

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
    [
      bbnStakingParams,
      btcConnected,
      btcNetwork,
      address,
      publicKeyNoCoord,
      signPsbt,
    ],
  );

  /**
   * Submit the withdrawal transaction
   * For withdrawal from a staking transaction that has expired, or from an early
   * unbonding transaction
   * If earlyUnbondingTxHex is provided, the early unbonding transaction will be used,
   * otherwise the staking transaction will be used
   *
   * @param stakingInput - The staking inputs
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
      // Perform checks
      if (!bbnStakingParams) {
        throw new ClientError({
          message: "Staking params not loaded",
          category: ClientErrorCategory.CLIENT_VALIDATION,
          state: ErrorState.TRANSITION,
        });
      }
      if (!btcConnected || !btcNetwork) {
        throw new ClientError({
          message: "BTC Wallet not connected",
          category: ClientErrorCategory.CLIENT_NETWORK,
          state: ErrorState.WALLET,
        });
      }
      validateStakingInput(stakingInput);

      // Get the staking params at the time of the staking transaction
      const stakingParam = getBbnParamByBtcHeight(
        stakingHeight,
        bbnStakingParams,
      );

      if (!stakingParam) {
        throw new ClientError({
          message: `Params for height ${stakingHeight} not found`,
          category: ClientErrorCategory.CLIENT_VALIDATION,
          state: ErrorState.TRANSITION,
        });
      }

      // Warning: We using the "Staking" instead of "ObservableStaking"
      // because withdrawal transactions does not require phase-1 specific tags
      const staking = new Staking(
        btcNetwork!,
        {
          address,
          publicKeyNoCoordHex: publicKeyNoCoord,
        },
        stakingParam,
        stakingInput.finalityProviderPkNoCoordHex,
        stakingInput.stakingTimelock,
      );

      let psbtResult: PsbtResult;
      if (earlyUnbondingTxHex) {
        psbtResult = staking.createWithdrawEarlyUnbondedTransaction(
          Transaction.fromHex(earlyUnbondingTxHex),
          defaultFeeRate,
        );
      } else {
        psbtResult = staking.createWithdrawStakingExpiredTransaction(
          Transaction.fromHex(stakingTxHex),
          defaultFeeRate,
        );
      }

      const signedWithdrawalPsbtHex = await signPsbt(psbtResult.psbt.toHex());
      const signedWithdrawalTx = Psbt.fromHex(
        signedWithdrawalPsbtHex,
      ).extractTransaction();

      // Perform a safety check on the estimated transaction fee
      txFeeSafetyCheck(signedWithdrawalTx, defaultFeeRate, psbtResult.fee);

      await pushTx(signedWithdrawalTx.toHex());
    },
    [
      bbnStakingParams,
      btcConnected,
      btcNetwork,
      address,
      publicKeyNoCoord,
      signPsbt,
      pushTx,
      defaultFeeRate,
    ],
  );

  return {
    submitUnbondingTx,
    submitWithdrawalTx,
  };
}

// Get the staker signature from the unbonding transaction
const getStakerSignature = (unbondingTx: Transaction): string => {
  try {
    return unbondingTx.ins[0].witness[0].toString("hex");
  } catch (error) {
    throw new ClientError({
      message: "Invalid transaction signature",
      category: ClientErrorCategory.CLIENT_TRANSACTION,
      state: ErrorState.WITHDRAW,
    });
  }
};
