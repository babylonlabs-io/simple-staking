import { useCallback } from "react";

import { getDelegationV2 } from "@/ui/api/getDelegationsV2";
import { ONE_SECOND } from "@/ui/constants";
import { useError } from "@/ui/context/Error/ErrorProvider";
import { useBTCWallet } from "@/ui/context/wallet/BTCWalletProvider";
import { useCosmosWallet } from "@/ui/context/wallet/CosmosWalletProvider";
import { ClientError } from "@/ui/errors";
import { ERROR_CODES } from "@/ui/errors/codes";
import { useLogger } from "@/ui/hooks/useLogger";
import { useDelegationV2State } from "@/ui/state/DelegationV2State";
import {
  StakingStep,
  useStakingState,
  type FormFields,
} from "@/ui/state/StakingState";
import {
  DelegationV2StakingState as DelegationState,
  DelegationV2,
} from "@/ui/types/delegationsV2";
import { retry } from "@/ui/utils";
import { btcToSatoshi } from "@/ui/utils/btc";

import { useBbnTransaction } from "../client/rpc/mutation/useBbnTransaction";

import { useTransactionService } from "./useTransactionService";

export function useStakingService() {
  const { setFormData, goToStep, setProcessing, setVerifiedDelegation, reset } =
    useStakingState();
  const { sendBbnTx } = useBbnTransaction();
  const { refetch: refetchDelegations } = useDelegationV2State();
  const { addDelegation, updateDelegationStatus } = useDelegationV2State();
  const { estimateStakingFee, createDelegationEoi, submitStakingTx } =
    useTransactionService();
  const { handleError } = useError();
  const { publicKeyNoCoord, address: btcAddress } = useBTCWallet();
  const { bech32Address } = useCosmosWallet();
  const logger = useLogger();

  const calculateFeeAmount = ({
    finalityProvider,
    amount,
    term,
    feeRate,
  }: Omit<FormFields, "feeAmount">) => {
    logger.info("Calculating fee amount for EOI", {
      finalityProvider,
      amount,
      term,
      feeRate,
    });
    const eoiInput = {
      // TODO: To be replaced by multiple FPs
      finalityProviderPksNoCoordHex: [finalityProvider],
      stakingAmountSat: btcToSatoshi(amount),
      stakingTimelock: term,
      feeRate: feeRate,
    };
    // Calculate the staking fee
    const feeAmount = estimateStakingFee(eoiInput, feeRate);
    return feeAmount;
  };

  const displayPreview = useCallback(
    (formFields: FormFields) => {
      setFormData(formFields);
      goToStep(StakingStep.PREVIEW);
    },
    [setFormData, goToStep],
  );

  const createEOI = useCallback(
    async ({ finalityProvider, amount, term, feeRate }: FormFields) => {
      logger.info("Starting EOI creation process", {
        finalityProvider,
        amount,
        term,
        feeRate,
      });
      try {
        const eoiInput = {
          // TODO: To be replaced by multiple FPs
          finalityProviderPksNoCoordHex: [finalityProvider],
          stakingAmountSat: amount,
          stakingTimelock: term,
          feeRate: feeRate,
        };
        setProcessing(true);
        const { stakingTxHash, signedBabylonTx } = await createDelegationEoi(
          eoiInput,
          feeRate,
        );

        // Send the transaction
        goToStep(StakingStep.EOI_SEND_BBN);
        await sendBbnTx(signedBabylonTx);

        addDelegation({
          stakingAmount: amount,
          stakingTxHashHex: stakingTxHash,
          startHeight: 0,
          state: DelegationState.INTERMEDIATE_PENDING_VERIFICATION,
        });

        goToStep(StakingStep.VERIFYING);

        const delegation = await retry(
          () => getDelegationV2(stakingTxHash),
          (delegation) => delegation?.state === DelegationState.VERIFIED,
          5 * ONE_SECOND,
        );

        setVerifiedDelegation(delegation as DelegationV2);
        refetchDelegations();
        goToStep(StakingStep.VERIFIED);
        setProcessing(false);
      } catch (error: any) {
        const metadata = {
          userPublicKey: publicKeyNoCoord,
          btcAddress: btcAddress,
          babylonAddress: bech32Address,
        };
        const clientError = new ClientError(
          ERROR_CODES.TRANSACTION_PREPARATION_ERROR,
          "Error creating EOI",
          { cause: error as Error },
        );
        logger.error(clientError, {
          data: metadata,
        });
        handleError({
          error,
          metadata,
        });
        reset();
      }
    },
    [
      setProcessing,
      createDelegationEoi,
      goToStep,
      sendBbnTx,
      addDelegation,
      setVerifiedDelegation,
      handleError,
      reset,
      refetchDelegations,
      publicKeyNoCoord,
      btcAddress,
      bech32Address,
      logger,
    ],
  );

  const stakeDelegation = useCallback(
    async (delegation: DelegationV2) => {
      try {
        setProcessing(true);

        const {
          finalityProviderBtcPksHex,
          stakingAmount,
          stakingTimelock,
          paramsVersion,
          stakingTxHashHex,
          stakingTxHex,
        } = delegation;

        await submitStakingTx(
          {
            finalityProviderPksNoCoordHex: finalityProviderBtcPksHex,
            stakingAmountSat: stakingAmount,
            stakingTimelock,
          },
          paramsVersion,
          stakingTxHashHex,
          stakingTxHex,
        );
        updateDelegationStatus(
          stakingTxHashHex,
          DelegationState.INTERMEDIATE_PENDING_BTC_CONFIRMATION,
        );
        reset();
        goToStep(StakingStep.FEEDBACK_SUCCESS);
      } catch (error: any) {
        const clientError = new ClientError(
          ERROR_CODES.TRANSACTION_SUBMISSION_ERROR,
          "Error submitting staking transaction",
          { cause: error as Error },
        );
        logger.error(clientError);
        reset();
        handleError({
          error,
          displayOptions: {
            retryAction: () => stakeDelegation(delegation),
          },
          metadata: {
            stakingTxHash: delegation.stakingTxHashHex,
            userPublicKey: publicKeyNoCoord,
            btcAddress: btcAddress,
            babylonAddress: bech32Address,
          },
        });
      }
    },
    [
      updateDelegationStatus,
      submitStakingTx,
      goToStep,
      setProcessing,
      reset,
      handleError,
      publicKeyNoCoord,
      btcAddress,
      bech32Address,
      logger,
    ],
  );

  return { calculateFeeAmount, displayPreview, createEOI, stakeDelegation };
}
