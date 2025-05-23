import { SigningStep } from "@babylonlabs-io/btc-staking-ts";
import { useCallback, useEffect } from "react";

import { getDelegationV2 } from "@/app/api/getDelegationsV2";
import { ONE_SECOND } from "@/app/constants";
import { useError } from "@/app/context/Error/ErrorProvider";
import {
  RegistrationStep,
  useDelegationState,
} from "@/app/state/DelegationState";
import { useDelegationV2State } from "@/app/state/DelegationV2State";
import { DelegationV2StakingState as DelegationState } from "@/app/types/delegationsV2";
import { ClientError, ERROR_CODES } from "@/errors";
import { useLogger } from "@/hooks/useLogger";
import { retry } from "@/utils";

import { useBbnTransaction } from "../client/rpc/mutation/useBbnTransaction";

import { useTransactionService } from "./useTransactionService";

interface RegistrationData {
  stakingTxHex: string;
  startHeight: number;
  stakingInput: {
    finalityProviderPkNoCoordHex: string;
    stakingAmountSat: number;
    stakingTimelock: number;
  };
}

type RegistrationSigningStep = Extract<
  SigningStep,
  | "staking-slashing"
  | "unbonding-slashing"
  | "proof-of-possession"
  | "create-btc-delegation-msg"
>;

const REGISTRATION_STEP_MAP: Record<RegistrationSigningStep, RegistrationStep> =
  {
    [SigningStep.STAKING_SLASHING]: "registration-staking-slashing",
    [SigningStep.UNBONDING_SLASHING]: "registration-unbonding-slashing",
    [SigningStep.PROOF_OF_POSSESSION]: "registration-proof-of-possession",
    [SigningStep.CREATE_BTC_DELEGATION_MSG]: "registration-sign-bbn",
  };

export function useRegistrationService() {
  const {
    setRegistrationStep: setStep,
    setProcessing,
    selectedDelegation,
    resetRegistration: reset,
    refetch: refetchV1Delegations,
  } = useDelegationState();
  const { transitionPhase1Delegation, subscribeToSigningSteps } =
    useTransactionService();
  const { addDelegation, refetch: refetchV2Delegations } =
    useDelegationV2State();
  const { sendBbnTx } = useBbnTransaction();
  const { handleError } = useError();
  const logger = useLogger();

  useEffect(() => {
    const unsubscribe = subscribeToSigningSteps((step: SigningStep) => {
      const stepName = REGISTRATION_STEP_MAP[step as RegistrationSigningStep];
      if (stepName) {
        setStep(stepName);
      }
    });

    return unsubscribe;
  }, [subscribeToSigningSteps, setStep]);

  const registerPhase1Delegation = useCallback(async () => {
    // set the step to staking-slashing
    setStep("registration-staking-slashing");

    if (!selectedDelegation) {
      const clientError = new ClientError(
        ERROR_CODES.VALIDATION_ERROR,
        "No delegation selected for registration",
      );
      logger.warn(clientError.message);
      handleError({
        error: clientError,
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

      logger.info("Executing registration action", {
        selectedDelegationId: selectedDelegation?.stakingTxHashHex,
        stakingTxHex: registrationData.stakingTxHex,
        stakingHeight: registrationData.startHeight,
      });

      const { signedBabylonTx } = await transitionPhase1Delegation(
        registrationData.stakingTxHex,
        registrationData.startHeight,
        registrationData.stakingInput,
      );
      // Send the transaction
      setStep("registration-send-bbn");
      await sendBbnTx(signedBabylonTx);

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
      });
      reset();
    }
  }, [
    setStep,
    selectedDelegation,
    handleError,
    setProcessing,
    transitionPhase1Delegation,
    sendBbnTx,
    addDelegation,
    refetchV1Delegations,
    refetchV2Delegations,
    reset,
    logger,
  ]);

  return { registerPhase1Delegation };
}
