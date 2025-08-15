import { useCallback } from "react";

import { getDelegationV2 } from "@/ui/common/api/getDelegationsV2";
import { ONE_SECOND } from "@/ui/common/constants";
import { useError } from "@/ui/common/context/Error/ErrorProvider";
import { useBTCWallet } from "@/ui/common/context/wallet/BTCWalletProvider";
import { ClientError, ERROR_CODES } from "@/ui/common/errors";
import { useLogger } from "@/ui/common/hooks/useLogger";
import { useDelegationV2State } from "@/ui/common/state/DelegationV2State";
import { useStakingExpansionState } from "@/ui/common/state/StakingExpansionState";
import {
  StakingExpansionStep,
  type StakingExpansionFormData,
} from "@/ui/common/state/StakingExpansionTypes";
import {
  DelegationV2StakingState as DelegationState,
  DelegationV2,
} from "@/ui/common/types/delegationsV2";
import { retry } from "@/ui/common/utils";
import { getTxHex } from "@/ui/common/utils/mempool_api";
import { validateExpansionFormData } from "@/ui/common/utils/stakingExpansionValidation";

import { useBbnTransaction } from "../client/rpc/mutation/useBbnTransaction";

import {
  useTransactionService,
  type BtcStakingExpansionInputs,
} from "./useTransactionService";

/**
 * Helper function to extract covenant expansion signatures from delegation data.
 * These signatures are available after the expansion EOI is verified by Babylon.
 */
const getCovenantExpansionSignatures = (delegation: any) => {
  if (!delegation?.covenantUnbondingSignatures) {
    return [];
  }

  return delegation.covenantUnbondingSignatures
    .filter((sig: any) => sig.stakeExpansionSignatureHex)
    .map((sig: any) => ({
      btcPkHex: sig.covenantBtcPkHex,
      sigHex: sig.stakeExpansionSignatureHex,
    }));
};

/**
 * Combines existing finality providers with newly selected BSN+FP pairs.
 */
const combineProviders = (
  existingProviders: string[],
  selectedBsnFps: Record<string, string>,
): string[] => {
  const newProviders = Object.values(selectedBsnFps);
  return [...existingProviders, ...newProviders];
};

/**
 * Fetches and validates transaction hex from mempool API.
 */
const fetchAndValidateTxHex = async (
  stakingTxHashHex: string,
): Promise<string> => {
  const txHex = await getTxHex(stakingTxHashHex);

  if (!txHex || typeof txHex !== "string" || txHex.length === 0) {
    throw new Error(`Failed to fetch transaction hex for ${stakingTxHashHex}`);
  }

  return txHex;
};

/**
 * Builds the standardized expansion input object for transaction operations.
 */
const buildExpansionInput = (
  formData: StakingExpansionFormData,
  allProviders: string[],
  previousStakingTxHex: string,
): BtcStakingExpansionInputs => ({
  finalityProviderPksNoCoordHex: allProviders,
  stakingAmountSat: formData.originalDelegation.stakingAmount,
  stakingTimelock: formData.stakingTimelock,
  previousStakingTxHex,
  previousStakingParamsVersion: formData.originalDelegation.paramsVersion,
  previousStakingInput: {
    finalityProviderPksNoCoordHex:
      formData.originalDelegation.finalityProviderBtcPksHex,
    stakingAmountSat: formData.originalDelegation.stakingAmount,
    stakingTimelock: formData.originalDelegation.stakingTimelock,
  },
});

/**
 * Hook providing staking expansion services and business logic.
 * Handles the complete expansion workflow from fee calculation to transaction submission.
 */
export function useStakingExpansionService() {
  const { setFormData, goToStep, setProcessing, setVerifiedDelegation } =
    useStakingExpansionState();
  const { sendBbnTx } = useBbnTransaction();
  const {
    addDelegation,
    updateDelegationStatus,
    refetch: refetchDelegations,
  } = useDelegationV2State();
  const {
    estimateStakingExpansionFee,
    createStakingExpansionEoi,
    submitStakingExpansionTx,
  } = useTransactionService();
  const { handleError } = useError();
  const { publicKeyNoCoord } = useBTCWallet();
  const logger = useLogger();

  /**
   * Calculate the fee amount for a staking expansion transaction.
   */
  const calculateExpansionFeeAmount = useCallback(
    async (formData: StakingExpansionFormData) => {
      if (!validateExpansionFormData(formData)) {
        throw new ClientError(
          ERROR_CODES.VALIDATION_ERROR,
          "Invalid expansion form data provided",
        );
      }

      try {
        const previousStakingTxHex = await fetchAndValidateTxHex(
          formData.originalDelegation.stakingTxHashHex,
        );

        const existingProviders =
          formData.originalDelegation.finalityProviderBtcPksHex || [];
        const allProviders = combineProviders(
          existingProviders,
          formData.selectedBsnFps,
        );

        const expansionInput = buildExpansionInput(
          formData,
          allProviders,
          previousStakingTxHex,
        );

        const feeAmount = estimateStakingExpansionFee(
          expansionInput,
          formData.feeRate,
        );

        return feeAmount;
      } catch (error) {
        throw new ClientError(
          ERROR_CODES.STAKING_EXPANSION_FEE_ERROR,
          "Failed to calculate expansion fee",
          { cause: error },
        );
      }
    },
    [estimateStakingExpansionFee],
  );

  /**
   * Display the expansion preview with calculated fees and selected BSN+FP pairs.
   * This transitions the user to the preview step before signing.
   */
  const displayExpansionPreview = useCallback(
    (formFields: StakingExpansionFormData) => {
      if (!validateExpansionFormData(formFields)) {
        throw new Error("Cannot display preview with invalid form data");
      }

      setFormData(formFields);
      goToStep(StakingExpansionStep.PREVIEW);
    },
    [setFormData, goToStep],
  );

  const createExpansionEOI = useCallback(
    async (formData: StakingExpansionFormData) => {
      try {
        const previousStakingTxHex = await fetchAndValidateTxHex(
          formData.originalDelegation.stakingTxHashHex,
        );

        const existingProviders =
          formData.originalDelegation.finalityProviderBtcPksHex || [];
        const allProviders = combineProviders(
          existingProviders,
          formData.selectedBsnFps,
        );

        const expansionInput = buildExpansionInput(
          formData,
          allProviders,
          previousStakingTxHex,
        );

        setProcessing(true);
        const { stakingTxHash, signedBabylonTx } =
          await createStakingExpansionEoi(expansionInput, formData.feeRate);
        await sendBbnTx(signedBabylonTx);
        const stakingTxHashHex = stakingTxHash; // Use the hash from the expansion result
        // BBN transaction sent successfully

        if (stakingTxHashHex !== stakingTxHash) {
          const clientError = new ClientError(
            ERROR_CODES.VALIDATION_ERROR,
            `Staking expansion transaction hash mismatch, expected ${stakingTxHash} but got ${stakingTxHashHex}`,
          );
          throw clientError;
        }

        // Create pending delegation object and add to state
        const pendingDelegation: DelegationV2 = {
          stakingTxHashHex: stakingTxHashHex,
          stakerBtcPkHex: publicKeyNoCoord,
          finalityProviderBtcPksHex: allProviders,
          stakingAmount: formData.originalDelegation.stakingAmount,
          stakingTxHex: "", // Will be filled when transaction is confirmed
          bbnInceptionHeight: 0,
          bbnInceptionTime: "",
          startHeight: 0,
          endHeight: 0,
          stakingTimelock: formData.stakingTimelock,
          unbondingTimelock: 0,
          unbondingTxHex: "",
          canExpand: false,
          slashing: {
            stakingSlashingTxHex: "",
            unbondingSlashingTxHex: "",
            spendingHeight: 0,
          },
          state: DelegationState.INTERMEDIATE_PENDING_VERIFICATION,
          paramsVersion: formData.originalDelegation.paramsVersion || 0,
        };

        addDelegation(pendingDelegation);
        goToStep(StakingExpansionStep.VERIFYING);

        // Poll for verification - same as regular staking flow
        const delegation = await retry(
          () => getDelegationV2(stakingTxHashHex),
          (delegation) => delegation?.state === DelegationState.VERIFIED,
          5 * ONE_SECOND,
        );

        setVerifiedDelegation(delegation as DelegationV2);
        refetchDelegations();
        goToStep(StakingExpansionStep.VERIFIED);
        setProcessing(false);
      } catch (error) {
        setProcessing(false);

        // Ensure we have a proper Error object for the logger
        const properError =
          error instanceof Error
            ? error
            : new Error(
                typeof error === "string"
                  ? error
                  : "Unknown error in expansion EOI creation",
              );

        logger.error(properError);
        handleError({ error: properError });
      }
    },
    [
      createStakingExpansionEoi,
      sendBbnTx,
      setProcessing,
      setVerifiedDelegation,
      goToStep,
      addDelegation,
      refetchDelegations,
      publicKeyNoCoord,
      logger,
      handleError,
    ],
  );

  const stakeDelegationExpansion = useCallback(
    async (delegation: DelegationV2) => {
      try {
        setProcessing(true);

        // Validate that we have the required transaction data from the API
        if (!delegation.stakingTxHex) {
          throw new Error(
            "Missing staking_tx_hex from verified delegation. Cannot proceed with expansion.",
          );
        }

        if (!delegation.stakingTxHashHex) {
          throw new Error(
            "Missing staking_tx_hash_hex from verified delegation. Cannot proceed with expansion.",
          );
        }

        // Extract covenant expansion signatures from the delegation
        const covenantExpansionSignatures =
          getCovenantExpansionSignatures(delegation);

        if (
          !covenantExpansionSignatures ||
          covenantExpansionSignatures.length === 0
        ) {
          throw new Error(
            "No covenant expansion signatures found in delegation. Make sure the expansion EOI was verified by Babylon.",
          );
        }

        // Get the original delegation data if this is an expansion
        let previousStakingTxHex = delegation.stakingTxHex;
        let previousStakingInput = {
          finalityProviderPksNoCoordHex: delegation.finalityProviderBtcPksHex,
          stakingAmountSat: delegation.stakingAmount,
          stakingTimelock: delegation.stakingTimelock,
        };

        // If this is an expansion, fetch the original delegation data
        if (delegation.previousStakingTxHashHex) {
          const originalDelegation = await getDelegationV2(
            delegation.previousStakingTxHashHex,
          );
          if (originalDelegation) {
            previousStakingTxHex = originalDelegation.stakingTxHex;
            previousStakingInput = {
              finalityProviderPksNoCoordHex:
                originalDelegation.finalityProviderBtcPksHex,
              stakingAmountSat: originalDelegation.stakingAmount,
              stakingTimelock: originalDelegation.stakingTimelock,
            };
          }
        }

        // Create expansion input data
        const expansionInput: BtcStakingExpansionInputs = {
          finalityProviderPksNoCoordHex: delegation.finalityProviderBtcPksHex,
          stakingAmountSat: delegation.stakingAmount,
          stakingTimelock: delegation.stakingTimelock,
          previousStakingTxHex,
          previousStakingParamsVersion: delegation.paramsVersion || 0,
          previousStakingInput,
        };

        // Submit the staking expansion transaction using the verified delegation data
        await submitStakingExpansionTx(
          expansionInput,
          delegation.paramsVersion || 0,
          delegation.stakingTxHashHex,
          delegation.stakingTxHex,
          covenantExpansionSignatures,
        );

        // Update delegation status to pending BTC confirmation
        updateDelegationStatus(
          delegation.stakingTxHashHex,
          DelegationState.INTERMEDIATE_PENDING_BTC_CONFIRMATION,
        );

        // Navigate to success
        goToStep(StakingExpansionStep.FEEDBACK_SUCCESS);
        setProcessing(false);
      } catch (error) {
        setProcessing(false);
        const properError =
          error instanceof Error
            ? error
            : new Error(
                typeof error === "string"
                  ? error
                  : "Failed to stake delegation expansion",
              );
        logger.error(properError);
        handleError({ error: properError });
      }
    },
    [
      setProcessing,
      goToStep,
      logger,
      handleError,
      submitStakingExpansionTx,
      updateDelegationStatus,
    ],
  );

  return {
    calculateExpansionFeeAmount,
    displayExpansionPreview,
    createExpansionEOI,
    stakeDelegationExpansion,
  };
}
