import { SigningStep } from "@babylonlabs-io/btc-staking-ts";
import { useCallback, useEffect } from "react";

import { getDelegationV2 } from "@/app/api/getDelegationsV2";
import { ONE_SECOND } from "@/app/constants";
import { useError } from "@/app/context/Error/ErrorProvider";
import { useBTCWallet } from "@/app/context/wallet/BTCWalletProvider";
import { useCosmosWallet } from "@/app/context/wallet/CosmosWalletProvider";
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

import { useBbnTransaction } from "../client/rpc/mutation/useBbnTransaction";

import { useTransactionService } from "./useTransactionService";

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
  const { publicKeyNoCoord, address: btcAddress } = useBTCWallet();
  const { bech32Address } = useCosmosWallet();

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
    const eoiInput = {
      finalityProviderPkNoCoordHex: finalityProvider,
      stakingAmountSat: btcToSatoshi(amount),
      stakingTimelock: term,
      feeRate: feeRate,
    };
    // Calculate the staking fee
    return estimateStakingFee(eoiInput, feeRate);
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
          metadata: {
            userPublicKey: publicKeyNoCoord,
            btcAddress: btcAddress,
            babylonAddress: bech32Address,
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
      publicKeyNoCoord,
      btcAddress,
      bech32Address,
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
    ],
  );

  return { calculateFeeAmount, displayPreview, createEOI, stakeDelegation };
}
