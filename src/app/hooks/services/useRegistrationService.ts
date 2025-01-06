import { useCallback } from "react";

import { useError } from "@/app/context/Error/ErrorContext";
import {
  useRegistrationState,
  type RegistrationFormFields,
} from "@/app/state/RegistrationState";
import { ErrorState } from "@/app/types/errors";

import { SigningStep, useTransactionService } from "./useTransactionService";

export function useRegistrationService() {
  const { setFormData, setStep, setProcessing, reset } = useRegistrationState();
  const { transitionPhase1Delegation } = useTransactionService();
  const { showError } = useError();

  const startPhase1Registration = useCallback(
    (formFields: RegistrationFormFields) => {
      setFormData(formFields);
      setStep("staking-slashing");
    },
    [setFormData, setStep],
  );

  const registerPhase1Delegation = useCallback(
    async (formData: RegistrationFormFields) => {
      try {
        setProcessing(true);

        await transitionPhase1Delegation(
          formData.stakingTxHex,
          formData.startHeight,
          formData.stakingInput,
          async (step: SigningStep) => {
            switch (step) {
              case SigningStep.STAKING_SLASHING:
                setStep("staking-slashing");
                break;
              case SigningStep.UNBONDING_SLASHING:
                setStep("unbonding-slashing");
                break;
              case SigningStep.PROOF_OF_POSSESSION:
                setStep("proof-of-possession");
                break;
              case SigningStep.SIGN_BBN:
                setStep("sign-bbn");
                break;
              case SigningStep.SEND_BBN:
                setStep("send-bbn");
                break;
            }
          },
        );

        setStep("complete");
        setProcessing(false);
      } catch (error: any) {
        reset();
        showError({
          error: {
            message: error.message,
            errorState: ErrorState.TRANSITION,
          },
        });
      }
    },
    [transitionPhase1Delegation, setProcessing, setStep, reset, showError],
  );

  return { startPhase1Registration, registerPhase1Delegation };
}
