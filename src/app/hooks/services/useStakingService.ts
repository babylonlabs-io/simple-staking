import { SigningStep } from "@babylonlabs-io/btc-staking-ts";
import { useCallback, useEffect } from "react";

import { getDelegationV2 } from "@/app/api/getDelegationsV2";
import { ONE_SECOND } from "@/app/constants";
import { ClientErrorCategory } from "@/app/constants/errorMessages";
import { useError } from "@/app/context/Error/ErrorProvider";
import { ClientError } from "@/app/context/Error/errors";
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
import { ErrorType } from "@/app/types/errors";
import { retry } from "@/utils";
import { btcToSatoshi } from "@/utils/btc";

import { useBbnTransaction } from "../client/rpc/mutation/useBbnTransaction";

import { useTransactionService } from "./useTransactionService";

// Set this to true to trigger the test error, false to disable
const ENABLE_TEST_ERROR = true;

type StakingSigningStep = Extract<
  SigningStep,
  | "staking-slashing"
  | "unbonding-slashing"
  | "proof-of-possession"
  | "create-btc-delegation-msg"
>;

const STAKING_SIGNING_STEP_MAP: Record<StakingSigningStep, StakingStep> = {
  "staking-slashing": StakingStep.EOI_STAKING_SLASHING,
  "unbonding-slashing": StakingStep.EOI_UNBONDING_SLASHING,
  "proof-of-possession": StakingStep.EOI_PROOF_OF_POSSESSION,
  "create-btc-delegation-msg": StakingStep.EOI_SIGN_BBN,
};

export function useStakingService() {
  const { setFormData, goToStep, setProcessing, setVerifiedDelegation, reset } =
    useStakingState();
  const { sendBbnTx } = useBbnTransaction();
  const { refetch: refetchDelegations } = useDelegationV2State();
  const { addDelegation, updateDelegationStatus } = useDelegationV2State();
  const {
    estimateStakingFee,
    createDelegationEoi,
    submitStakingTx,
    subscribeToSigningSteps,
  } = useTransactionService();
  const { handleError } = useError();

  useEffect(() => {
    const unsubscribe = subscribeToSigningSteps((step: SigningStep) => {
      const stepName = STAKING_SIGNING_STEP_MAP[step as StakingSigningStep];
      if (stepName) {
        goToStep(stepName);
      }
    });

    return unsubscribe;
  }, [subscribeToSigningSteps, goToStep]);

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
      if (process.env.NODE_ENV !== "production" && ENABLE_TEST_ERROR) {
        const testError = new ClientError({
          message: "This is a test error to verify error handling",
          type: ErrorType.STAKING,
          category: ClientErrorCategory.CLIENT_TRANSACTION,
        });

        handleError({
          error: testError,
          displayOptions: {
            retryAction: () => displayPreview(formFields),
          },
          userInfo: {
            stakingTxHash: "test-tx-hash-12345",
          },
        });
        return;
      }

      setFormData(formFields);
      goToStep(StakingStep.PREVIEW);
    },
    [setFormData, goToStep, handleError],
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
        handleError({
          error,
          userInfo: {
            stakingTxHash: undefined,
          },
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
          userInfo: {
            stakingTxHash: delegation.stakingTxHashHex,
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

  // Function to trigger a test error for debugging
  const triggerTestError = useCallback(() => {
    if (process.env.NODE_ENV !== "production") {
      const testError = new ClientError({
        message: "This is a manually triggered test error",
        type: ErrorType.STAKING,
        category: ClientErrorCategory.CLIENT_TRANSACTION,
      });

      handleError({
        error: testError,
        displayOptions: {
          retryAction: () => console.log("Retry action triggered"),
        },
        userInfo: {
          stakingTxHash: "test-tx-hash-manual-trigger",
        },
      });
    }
  }, [handleError]);

  return {
    calculateFeeAmount,
    displayPreview,
    createEOI,
    stakeDelegation,
    triggerTestError, // Export the test function
  };
}
