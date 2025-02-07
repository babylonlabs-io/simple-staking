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
import { useBbnQuery } from "../client/rpc/queries/useBbnQuery";

import { BtcStakingInputs } from "./useTransactionService";

export function useV1TransactionService() {
  const {
    connected: btcConnected,
    signPsbt,
    publicKeyNoCoord,
    address,
    network: btcNetwork,
    pushTx,
    signMessage,
  } = useBTCWallet();
  const { data: networkFees } = useNetworkFees();
  const { defaultFeeRate } = getFeeRateFromMempool(networkFees);
  const { networkInfo, availableUTXOs } = useAppState();

  const { signBbnTx } = useBbnTransaction();
  const {
    btcTipQuery: { data: tipHeader },
  } = useBbnQuery();

  const { connected: cosmosConnected, bech32Address } = useCosmosWallet();

  // We use phase-2 parameters instead of legacy global parameters.
  // Phase-2 BBN parameters include all phase-1 global parameters,
  // except for the "tag" field which is only used for staking transactions.
  // The "tag" is not needed for withdrawal or unbonding transactions.
  // const bbnStakingParams = networkInfo?.params.bbnStakingParams.versions;
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
      if (!btcStakingManager) {
        throw new Error("BTC Staking Manager not initialized");
      }
      validateStakingInput(stakingInput);

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
        await btcStakingManager.createPartialSignedBtcUnbondingTransaction(
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
    [btcStakingManager],
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
      if (!btcStakingManager) {
        throw new Error("BTC Staking Manager not initialized");
      }
      if (!versionedParams) {
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
          await btcStakingManager.createSignedBtcWithdrawEarlyUnbondedTransaction(
            stakingInput,
            paramVersion,
            earlyUnbondingTx,
            defaultFeeRate,
          );
      } else {
        result =
          await btcStakingManager.createSignedBtcWithdrawStakingExpiredTransaction(
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
    [btcStakingManager, defaultFeeRate, pushTx, versionedParams],
  );

  return {
    submitUnbondingTx,
    submitWithdrawalTx,
  };
}
