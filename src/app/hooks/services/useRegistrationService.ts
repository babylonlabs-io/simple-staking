import { SigningType } from "@babylonlabs-io/btc-staking-ts";
import { useCallback } from "react";

import { getDelegationV2 } from "@/app/api/getDelegationsV2";
import { ONE_SECOND } from "@/app/constants";
import { ClientErrorCategory } from "@/app/constants/errorMessages";
import { useError } from "@/app/context/Error/ErrorProvider";
import { ClientError } from "@/app/context/Error/errors";
import { useDelegationState } from "@/app/state/DelegationState";
import { useDelegationV2State } from "@/app/state/DelegationV2State";
import { DelegationV2StakingState as DelegationState } from "@/app/types/delegationsV2";
import { ErrorType } from "@/app/types/errors";
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

  const registerPhase1Delegation = useCallback(async () => {
    // set the step to staking-slashing
    setStep("registration-staking-slashing");

    if (!selectedDelegation) {
      handleError({
        error: new ClientError({
          message: "No delegation selected for registration",
          category: ClientErrorCategory.CLIENT_VALIDATION,
          type: ErrorType.REGISTRATION,
        }),
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

      const unsubscribe = subscribeToSigningSteps((step: SigningType) => {
        switch (step) {
          case SigningType.STAKING_SLASHING:
            setStep("registration-staking-slashing");
            break;
          case SigningType.UNBONDING_SLASHING:
            setStep("registration-unbonding-slashing");
            break;
          case SigningType.PROOF_OF_POSSESSION:
            setStep("registration-proof-of-possession");
            break;
          case SigningType.CREATE_BTC_DELEGATION_MSG:
            setStep("registration-sign-bbn");
            break;
        }
      });

      const { signedBabylonTx } = await transitionPhase1Delegation(
        registrationData.stakingTxHex,
        registrationData.startHeight,
        registrationData.stakingInput,
      );
      // Send the transaction
      setStep("registration-send-bbn");
      await sendBbnTx(signedBabylonTx);
      // Unsubscribe from signing steps
      unsubscribe();

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
    subscribeToSigningSteps,
    transitionPhase1Delegation,
    sendBbnTx,
    addDelegation,
    refetchV1Delegations,
    refetchV2Delegations,
    reset,
  ]);

  return { registerPhase1Delegation };
}
