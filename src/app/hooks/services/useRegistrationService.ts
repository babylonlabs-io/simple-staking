import { useCallback } from "react";

import { getDelegationV2 } from "@/app/api/getDelegationsV2";
import { ONE_SECOND } from "@/app/constants";
import { ClientErrorCodes } from "@/app/constants/errorCodes";
import { useError } from "@/app/context/Error/ErrorProvider";
import { ClientError } from "@/app/context/Error/errors";
import { useDelegationState } from "@/app/state/DelegationState";
import { useDelegationV2State } from "@/app/state/DelegationV2State";
import { DelegationV2StakingState as DelegationState } from "@/app/types/delegationsV2";
import { ErrorState } from "@/app/types/errors";
import { retry } from "@/utils";

import { SigningStep, useTransactionService } from "./useTransactionService";

interface RegistrationData {
  stakingTxHex: string;
  startHeight: number;
  stakingInput: {
    finalityProviderPkNoCoordHex: string;
    stakingAmountSat: number;
    stakingTimelock: number;
  };
}

export function useRegistrationService() {
  const {
    setRegistrationStep: setStep,
    setProcessing,
    selectedDelegation,
    resetRegistration: reset,
    refetch: refetchV1Delegations,
  } = useDelegationState();
  const { transitionPhase1Delegation } = useTransactionService();
  const { addDelegation, refetch: refetchV2Delegations } =
    useDelegationV2State();
  const { handleError } = useError();

  const registerPhase1Delegation = useCallback(async () => {
    // set the step to staking-slashing
    setStep("registration-staking-slashing");

    if (!selectedDelegation) {
      handleError({
        error: new ClientError(
          "No delegation selected for registration",
          ClientErrorCodes.CLIENT_VALIDATION,
          ErrorState.TRANSITION,
        ),
        displayError: {
          errorState: ErrorState.TRANSITION,
        },
      });
      return;
    }

    try {
      setProcessing(true);

      const registrationData: RegistrationData = {
        stakingTxHex: selectedDelegation.stakingTx.txHex,
        startHeight: selectedDelegation.stakingTx.startHeight,
        stakingInput: {
          finalityProviderPkNoCoordHex:
            selectedDelegation.finalityProviderPkHex,
          stakingAmountSat: selectedDelegation.stakingValueSat,
          stakingTimelock: selectedDelegation.stakingTx.timelock,
        },
      };

      await transitionPhase1Delegation(
        registrationData.stakingTxHex,
        registrationData.startHeight,
        registrationData.stakingInput,
        async (step: SigningStep) => {
          setStep(`registration-${step}`);
        },
      );

      addDelegation({
        stakingAmount: selectedDelegation.stakingValueSat,
        stakingTxHashHex: selectedDelegation.stakingTxHashHex,
        startHeight: selectedDelegation.stakingTx.startHeight,
        state: DelegationState.INTERMEDIATE_PENDING_VERIFICATION,
      });

      setStep("registration-verifying");

      const delegation = await retry(
        () => getDelegationV2(selectedDelegation.stakingTxHashHex),
        (delegation) => delegation?.state === DelegationState.ACTIVE,
        5 * ONE_SECOND,
      );
      if (delegation) {
        setStep("registration-verified");
        // Refetch both v1 and v2 delegations to reflect the latest state
        refetchV1Delegations();
        refetchV2Delegations();
      }
      setProcessing(false);
    } catch (error: any) {
      handleError({
        error,
        displayError: {
          errorState: ErrorState.TRANSITION,
        },
      });
      reset();
    }
  }, [
    transitionPhase1Delegation,
    setProcessing,
    setStep,
    reset,
    handleError,
    selectedDelegation,
    addDelegation,
    refetchV1Delegations,
    refetchV2Delegations,
  ]);

  return { registerPhase1Delegation };
}
