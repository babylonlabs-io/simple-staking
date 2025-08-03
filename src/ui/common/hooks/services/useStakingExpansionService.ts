import { useCallback } from "react";

import { getDelegationV2 } from "@/ui/common/api/getDelegationsV2";
import { ONE_SECOND } from "@/ui/common/constants";
import { useError } from "@/ui/common/context/Error/ErrorProvider";
import { useBTCWallet } from "@/ui/common/context/wallet/BTCWalletProvider";
import { ClientError, ERROR_CODES } from "@/ui/common/errors";
import { useLogger } from "@/ui/common/hooks/useLogger";
import { useDelegationV2State } from "@/ui/common/state/DelegationV2State";
import {
  StakingExpansionStep,
  useStakingExpansionState,
  validateExpansionFormData,
  type StakingExpansionFormData,
} from "@/ui/common/state/StakingExpansionState";
import {
  DelegationV2StakingState as DelegationState,
  DelegationV2,
} from "@/ui/common/types/delegationsV2";
import { retry } from "@/ui/common/utils";
import { getTxHex } from "@/ui/common/utils/mempool_api";

import { useBbnTransaction } from "../client/rpc/mutation/useBbnTransaction";

// IMPROVE: Configuration constants extracted for better maintainability

/**
 * Helper function to extract covenant expansion signatures from delegation data.
 * These signatures are available after the expansion EOI is verified by Babylon.
 *
 * ENHANCE: Add proper TypeScript interfaces for delegation signature structure.
 * PROD: Add validation for signature format and completeness.
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
 * Enhanced error handling utility for expansion operations.
 * Converts various error types to user-friendly messages.
 */
const handleExpansionError = (error: unknown, context: string): Error => {
  if (error instanceof Error) {
    return error;
  }

  if (typeof error === "string") {
    return new Error(`${context}: ${error}`);
  }

  return new Error(`${context}: Unknown error occurred`);
};

import {
  useTransactionService,
  type BtcStakingExpansionInputs,
} from "./useTransactionService";

/**
 * Custom hook providing staking expansion services and business logic.
 * Handles the complete expansion workflow from fee calculation to transaction submission.
 *
 * PROD: Consider adding metrics/analytics for expansion success rates and error tracking.
 * MONITOR: Track expansion transaction fees and completion times.
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
   *
   * ENHANCE: Add caching for fee calculations to avoid repeated API calls.
   * OPTIMIZE: Consider batching multiple fee calculations if needed.
   */
  const calculateExpansionFeeAmount = useCallback(
    async (formData: StakingExpansionFormData) => {
      // IMPROVE: Validate form data before processing
      if (!validateExpansionFormData(formData)) {
        throw new Error("Invalid expansion form data provided");
      }

      try {
        logger.info("Calculating expansion fee", {
          stakingTxHash: formData.originalDelegation.stakingTxHashHex,
          newBsnCount: Object.keys(formData.selectedBsnFps).length,
        });

        // Fetch the previous staking transaction hex
        // ENHANCE: Add retry logic with exponential backoff for network requests
        const previousStakingTxHex = await getTxHex(
          formData.originalDelegation.stakingTxHashHex,
        );

        // IMPROVE: More comprehensive validation of transaction hex
        if (
          !previousStakingTxHex ||
          typeof previousStakingTxHex !== "string" ||
          previousStakingTxHex.length === 0
        ) {
          throw new Error(
            `Failed to fetch transaction hex for ${formData.originalDelegation.stakingTxHashHex}`,
          );
        }

        // OPTIMIZE: btc-staking-ts will automatically handle funding transaction selection from available UTXOs

        // Combine existing finality providers with new ones for expansion
        const existingProviders =
          formData.originalDelegation.finalityProviderBtcPksHex || [];
        const newProviders = Object.values(formData.selectedBsnFps);
        const allProviders = [...existingProviders, ...newProviders];

        const expansionInput: BtcStakingExpansionInputs = {
          finalityProviderPksNoCoordHex: allProviders,
          stakingAmountSat: formData.originalDelegation.stakingAmount,
          stakingTimelock: formData.stakingTimelock,
          previousStakingTxHex,
          previousStakingParamsVersion:
            formData.originalDelegation.paramsVersion,
          previousStakingInput: {
            finalityProviderPksNoCoordHex:
              formData.originalDelegation.finalityProviderBtcPksHex,
            stakingAmountSat: formData.originalDelegation.stakingAmount,
            stakingTimelock: formData.originalDelegation.stakingTimelock,
          },
        };

        const feeAmount = await estimateStakingExpansionFee(
          expansionInput,
          formData.feeRate,
        );

        logger.info("Expansion fee calculated successfully", {
          feeAmount,
          feeRate: formData.feeRate,
        });

        return feeAmount;
      } catch (error) {
        const properError = handleExpansionError(
          error,
          "Failed to calculate expansion fee",
        );
        logger.error(properError);
        throw properError;
      }
    },
    [estimateStakingExpansionFee, logger],
  );

  /**
   * Display the expansion preview with calculated fees and selected BSN+FP pairs.
   * This transitions the user to the preview step before signing.
   */
  const displayExpansionPreview = useCallback(
    (formFields: StakingExpansionFormData) => {
      // IMPROVE: Add validation before showing preview
      if (!validateExpansionFormData(formFields)) {
        throw new Error("Cannot display preview with invalid form data");
      }

      logger.info("Displaying expansion preview", {
        selectedBsnCount: Object.keys(formFields.selectedBsnFps).length,
        feeAmount: formFields.feeAmount,
      });

      setFormData(formFields);
      goToStep(StakingExpansionStep.PREVIEW);
    },
    [setFormData, goToStep, logger],
  );

  const createExpansionEOI = useCallback(
    async (formData: StakingExpansionFormData) => {
      try {
        // Fetch the previous staking transaction hex
        const previousStakingTxHex = await getTxHex(
          formData.originalDelegation.stakingTxHashHex,
        );

        // Validate transaction hex data
        if (
          !previousStakingTxHex ||
          typeof previousStakingTxHex !== "string" ||
          previousStakingTxHex.length === 0
        ) {
          throw new Error(
            `Failed to fetch transaction hex for ${formData.originalDelegation.stakingTxHashHex}`,
          );
        }

        // Combine existing finality providers with new ones for expansion
        const existingProviders =
          formData.originalDelegation.finalityProviderBtcPksHex || [];
        const newProviders = Object.values(formData.selectedBsnFps);
        const allProviders = [...existingProviders, ...newProviders];

        const expansionInput: BtcStakingExpansionInputs = {
          finalityProviderPksNoCoordHex: allProviders,
          stakingAmountSat: formData.originalDelegation.stakingAmount,
          stakingTimelock: formData.stakingTimelock,
          previousStakingTxHex,
          previousStakingParamsVersion:
            formData.originalDelegation.paramsVersion,
          previousStakingInput: {
            finalityProviderPksNoCoordHex:
              formData.originalDelegation.finalityProviderBtcPksHex,
            stakingAmountSat: formData.originalDelegation.stakingAmount,
            stakingTimelock: formData.originalDelegation.stakingTimelock,
          },
        };
        setProcessing(true);
        const { stakingTxHash, signedBabylonTx } =
          await createStakingExpansionEoi(expansionInput, formData.feeRate);
        await sendBbnTx(signedBabylonTx);
        const stakingTxHashHex = stakingTxHash; // Use the hash from the expansion result
        // paramVersion would be used here if needed for validation
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

        logger.info("Starting staking expansion process", {
          delegationHash: delegation.stakingTxHashHex,
          stakingTxHex: delegation.stakingTxHex,
          hasStakingTxHex: !!delegation.stakingTxHex,
        });

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

        logger.info("Found covenant expansion signatures", {
          count: covenantExpansionSignatures.length,
          signatures: covenantExpansionSignatures.map((s: any) => ({
            btcPkHex: s.btcPkHex,
            sigHex: s.sigHex.slice(0, 16) + "...",
          })),
        });

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

        logger.info("Submitting staking expansion transaction", {
          expectedTxHashHex: delegation.stakingTxHashHex,
          unsignedTxHex: delegation.stakingTxHex.slice(0, 32) + "...",
          covenantSignaturesCount: covenantExpansionSignatures.length,
        });

        // Submit the staking expansion transaction using the verified delegation data
        // delegation.stakingTxHashHex = expected final hash from API (staking_tx_hash_hex)
        // delegation.stakingTxHex = unsigned transaction from API (staking_tx_hex)
        await submitStakingExpansionTx(
          expansionInput,
          delegation.paramsVersion || 0,
          delegation.stakingTxHashHex, // Expected hash from API
          delegation.stakingTxHex, // Unsigned transaction from API
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
