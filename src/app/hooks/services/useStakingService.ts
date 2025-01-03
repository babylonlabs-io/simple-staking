import { useCallback } from "react";

import { getDelegationV2 } from "@/app/api/getDelegationsV2";
import { ONE_SECOND } from "@/app/constants";
import { useError } from "@/app/context/Error/ErrorContext";
import { useDelegationV2State } from "@/app/state/DelegationV2State";
import { type FormFields, useStakingState } from "@/app/state/StakingState";
import {
  DelegationV2StakingState as DelegationState,
  DelegationV2,
} from "@/app/types/delegationsV2";
import { ErrorState } from "@/app/types/errors";
import { retry } from "@/utils";
import { btcToSatoshi } from "@/utils/btc";

import { useTransactionService } from "./useTransactionService";

export function useStakingService() {
  const { setFormData, goToStep, setProcessing, setVerifiedDelegation, reset } =
    useStakingState();
  const { addDelegation, updateDelegationStatus } = useDelegationV2State();
  const { estimateStakingFee, createDelegationEoi, submitStakingTx } =
    useTransactionService();
  const { showError } = useError();

  const calculateFeeAmount = ({
    finalityProvider,
    amount,
    term,
    feeRate,
  }: Omit<FormFields, "feeAmount">) => {
    try {
      const eoiInput = {
        finalityProviderPkNoCoordHex: finalityProvider,
        stakingAmountSat: btcToSatoshi(amount),
        stakingTimelock: term,
        feeRate: feeRate,
      };
      // Calculate the staking fee
      return estimateStakingFee(eoiInput, feeRate);
    } catch {
      return 0;
    }
  };

  const displayPreview = useCallback(
    (formFields: FormFields) => {
      setFormData(formFields);
      goToStep("preview");
    },
    [setFormData, goToStep],
  );

  const createEOI = useCallback(
    async ({ finalityProvider, amount, term, feeRate }: FormFields) => {
      try {
        const eoiInput = {
          finalityProviderPkNoCoordHex: finalityProvider,
          stakingAmountSat: amount,
          stakingTimelock: term,
          feeRate: feeRate,
        };

        setProcessing(true);

        const stakingTxHashHex = await createDelegationEoi(
          eoiInput,
          feeRate,
          async (step) => goToStep(`eoi-${step}`),
        );

        addDelegation({
          stakingAmount: amount,
          stakingTxHashHex,
          startHeight: 0,
          state: DelegationState.INTERMEDIATE_PENDING_VERIFICATION,
        });

        goToStep("verifying");

        const delegation = await retry(
          () => getDelegationV2(stakingTxHashHex),
          (delegation) => delegation?.state === DelegationState.VERIFIED,
          5 * ONE_SECOND,
        );

        setVerifiedDelegation(delegation as DelegationV2);
        goToStep("verified");
        setProcessing(false);
      } catch (error: any) {
        reset();
        showError({
          error: {
            message: error.message,
            errorState: ErrorState.STAKING,
          },
        });
      }
    },
    [
      createDelegationEoi,
      setProcessing,
      addDelegation,
      goToStep,
      setVerifiedDelegation,
      showError,
      reset,
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
            finalityProviderPkNoCoordHex: finalityProviderBtcPksHex[0],
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
        goToStep("feedback-success");
      } catch (error: any) {
        reset();
        showError({
          error: {
            message: error.message,
            errorState: ErrorState.STAKING,
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
      showError,
    ],
  );

  return { calculateFeeAmount, displayPreview, createEOI, stakeDelegation };
}
