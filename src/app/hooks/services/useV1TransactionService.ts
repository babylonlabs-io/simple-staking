import { PsbtResult, Staking } from "@babylonlabs-io/btc-staking-ts";
import { Psbt, Transaction } from "bitcoinjs-lib";
import { useCallback } from "react";

import { useBTCWallet } from "@/app/context/wallet/BTCWalletProvider";
import { useAppState } from "@/app/state";
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
    signMessage,
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
        throw new Error("Staking params not loaded");
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
        throw new Error(
          `Unable to find staking params for height ${stakingHeight}`,
        );
      }

      // Warning: We using the "Staking" instead of "ObservableStaking"
      // because we only perform withdraw or unbonding transactions
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
    submitWithdrawalTx,
  };
}
