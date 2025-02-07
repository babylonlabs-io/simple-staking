import { SigningType } from "@babylonlabs-io/btc-staking-ts";
import { useCallback } from "react";

import { getDelegationV2 } from "@/app/api/getDelegationsV2";
import { ONE_SECOND } from "@/app/constants";
import { useError } from "@/app/context/Error/ErrorProvider";
import { useDelegationV2State } from "@/app/state/DelegationV2State";
import {
  type FormFields,
  StakingStep,
  useStakingState,
} from "@/app/state/StakingState";
import {
  DelegationV2StakingState as DelegationState,
  DelegationV2,
} from "@/app/types/delegationsV2";
import { retry } from "@/utils";
import { btcToSatoshi } from "@/utils/btc";

import { useTransactionService } from "./useTransactionService";

export function useStakingService() {
  const { setFormData, goToStep, setProcessing, setVerifiedDelegation, reset } =
    useStakingState();
  const { refetch: refetchDelegations } = useDelegationV2State();
  const { addDelegation, updateDelegationStatus } = useDelegationV2State();
  const {
    estimateStakingFee,
    createDelegationEoi,
    submitStakingTx,
    subscribeToSigningSteps,
  } = useTransactionService();
  const { handleError } = useError();

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
      goToStep(StakingStep.PREVIEW);
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
        const unsubscribe = subscribeToSigningSteps((step: SigningType) => {
          switch (step) {
            case SigningType.STAKING_SLASHING:
              goToStep(StakingStep.EOI_STAKING_SLASHING);
              break;
            case SigningType.UNBONDING_SLASHING:
              goToStep(StakingStep.EOI_UNBONDING_SLASHING);
              break;
            case SigningType.PROOF_OF_POSSESSION:
              goToStep(StakingStep.EOI_PROOF_OF_POSSESSION);
              break;
            case SigningType.CREATE_BTC_DELEGATION_MSG:
              goToStep(StakingStep.EOI_SIGN_BBN);
              break;
          }
        });

        const stakingTxHashHex = await createDelegationEoi(eoiInput, feeRate);
        unsubscribe();

        goToStep(StakingStep.EOI_SEND_BBN);

        addDelegation({
          stakingAmount: amount,
          stakingTxHashHex,
          startHeight: 0,
          state: DelegationState.INTERMEDIATE_PENDING_VERIFICATION,
        });

        goToStep(StakingStep.VERIFYING);

        const delegation = await retry(
          () => getDelegationV2(stakingTxHashHex),
          (delegation) => delegation?.state === DelegationState.VERIFIED,
          5 * ONE_SECOND,
        );

        setVerifiedDelegation(delegation as DelegationV2);
        refetchDelegations();
        goToStep(StakingStep.VERIFIED);
        setProcessing(false);
      } catch (error: any) {
        handleError({
          error,
        });
        reset();
      }
    },
    [
      setProcessing,
      subscribeToSigningSteps,
      createDelegationEoi,
      goToStep,
      addDelegation,
      setVerifiedDelegation,
      handleError,
      reset,
      refetchDelegations,
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
        goToStep(StakingStep.FEEDBACK_SUCCESS);
      } catch (error: any) {
        reset();
        handleError({
          error,
          displayOptions: {
            retryAction: () => stakeDelegation(delegation),
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
    ],
  );

  return { calculateFeeAmount, displayPreview, createEOI, stakeDelegation };
}
