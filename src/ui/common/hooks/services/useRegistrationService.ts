import { useCallback } from "react";

import { getDelegationV2 } from "@/ui/common/api/getDelegationsV2";
import { ONE_SECOND } from "@/ui/common/constants";
import { useError } from "@/ui/common/context/Error/ErrorProvider";
import { ClientError, ERROR_CODES } from "@/ui/common/errors";
import { useLogger } from "@/ui/common/hooks/useLogger";
import { useDelegationState } from "@/ui/common/state/DelegationState";
import { useDelegationV2State } from "@/ui/common/state/DelegationV2State";
import { DelegationV2StakingState as DelegationState } from "@/ui/common/types/delegationsV2";
import { retry } from "@/ui/common/utils";

import { useBbnTransaction } from "../client/rpc/mutation/useBbnTransaction";

import { useTransactionService } from "./useTransactionService";

interface RegistrationData {
  stakingTxHex: string;
  startHeight: number;
  stakingInput: {
    finalityProviderPksNoCoordHex: string[];
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
  const { sendBbnTx } = useBbnTransaction();
  const { handleError } = useError();
  const logger = useLogger();

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
          finalityProviderPksNoCoordHex: [
            // Phase-1 delegation only contains a single FP
            selectedDelegation.finalityProviderPkHex,
          ],
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
