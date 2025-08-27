/*
 * Staking Expansion Modal - Integrated with existing BSN/FP modals
 *
 * This modal uses the dedicated ExpansionChainSelectionModal and FinalityProviderModal
 * for expansion staking:
 * - No Babylon Genesis priority requirement (already exists in delegation)
 * - "Expand" button instead of "Done" when BSN+FP pairs are selected
 * - Allows adding multiple BSN+FP pairs before expanding
 */

import { Fragment, useCallback, useEffect, useMemo, useState } from "react";

import { FinalityProviderModal } from "@/ui/common/components/Multistaking/FinalityProviderField/FinalityProviderModal";
import { ExpansionChainSelectionModal } from "@/ui/common/components/StakingExpansion/ExpansionChainSelectionModal";
import { IS_FIXED_TERM_FIELD } from "@/ui/common/config";
import { getNetworkConfigBBN } from "@/ui/common/config/network/bbn";
import { useError } from "@/ui/common/context/Error/ErrorProvider";
import { useNetworkFees } from "@/ui/common/hooks/client/api/useNetworkFees";
import { useStakingExpansionService } from "@/ui/common/hooks/services/useStakingExpansionService";
import { useLogger } from "@/ui/common/hooks/useLogger";
import { useAppState } from "@/ui/common/state";
import {
  StakingModalPage,
  useFinalityProviderBsnState,
} from "@/ui/common/state/FinalityProviderBsnState";
import { useFinalityProviderState } from "@/ui/common/state/FinalityProviderState";
import { useStakingExpansionState } from "@/ui/common/state/StakingExpansionState";
import { type StakingExpansionFormData } from "@/ui/common/state/StakingExpansionTypes";
import { getFeeRateFromMempool } from "@/ui/common/utils/getFeeRateFromMempool";

// Get the Babylon Genesis BSN ID
const BSN_ID = getNetworkConfigBBN().chainId;

interface StakingExpansionModalProps {
  open: boolean;
  onClose: () => void;
}

/**
 * Staking Expansion Modal - Integrated Implementation
 *
 * This modal integrates with ExpansionChainSelectionModal and FinalityProviderModal
 * to provide BSN+FP selection for staking expansion.
 *
 * KEY DIFFERENCES FROM REGULAR STAKING:
 * - No Babylon Genesis priority requirement (already exists)
 * - "Expand" button shows when at least one BSN+FP pair is selected
 * - Allows continuous adding of BSN+FP pairs before expanding
 */
export const StakingExpansionModal = ({
  open,
  onClose,
}: StakingExpansionModalProps) => {
  const { formData, setFormData, reset, getAvailableBsnSlots } =
    useStakingExpansionState();

  const {
    stakingModalPage,
    setStakingModalPage,
    bsnList,
    bsnLoading,
    selectedBsnId,
    setSelectedBsnId,
  } = useFinalityProviderBsnState();

  const { getRegisteredFinalityProvider } = useFinalityProviderState();
  const { data: networkFees } = useNetworkFees();
  const { defaultFeeRate } = getFeeRateFromMempool(networkFees);
  const { calculateExpansionFeeAmount, displayExpansionPreview } =
    useStakingExpansionService();
  const { networkInfo, isLoading: isUTXOsLoading } = useAppState();
  const logger = useLogger();
  const { handleError } = useError();

  // Calculate the default staking timelock using the same logic as regular staking
  const defaultStakingTimeBlocks = useMemo(() => {
    const latestParam = networkInfo?.params.bbnStakingParams?.latestParam;
    if (!latestParam) {
      // Return undefined if network info not available, will be set later when available
      return undefined;
    }

    const { minStakingTimeBlocks = 0, maxStakingTimeBlocks = 0 } = latestParam;

    // Use the exact same logic as regular staking (StakingState.tsx:210-213)
    return IS_FIXED_TERM_FIELD || minStakingTimeBlocks === maxStakingTimeBlocks
      ? maxStakingTimeBlocks
      : undefined; // For variable term, don't set a default - let user choose
  }, [networkInfo]);

  // Local state for tracking selected BSN+FP pairs
  const [selectedBsnFps, setSelectedBsnFps] = useState<Record<string, string>>(
    {},
  );
  const [isCalculatingFee, setIsCalculatingFee] = useState(false);

  // Get existing BSN+FP pairs from the original delegation with safety checks
  const existingBsnFps = useMemo(() => {
    try {
      // Safety checks for data availability
      if (!formData?.originalDelegation?.finalityProviderBtcPksHex) {
        return {};
      }

      // Ensure it's an array
      const fpPkHexArray = Array.isArray(
        formData.originalDelegation.finalityProviderBtcPksHex,
      )
        ? formData.originalDelegation.finalityProviderBtcPksHex
        : [];

      if (fpPkHexArray.length === 0) {
        return {};
      }

      const pairs: Record<string, string> = {};

      fpPkHexArray.forEach((fpPkHex) => {
        if (!fpPkHex || typeof fpPkHex !== "string") {
          return;
        }

        const fp = getRegisteredFinalityProvider(fpPkHex);
        if (fp) {
          // Use bsnId if available, otherwise it's a Babylon Genesis FP (bsnId is null)
          const bsnId = fp.bsnId || BSN_ID;
          pairs[bsnId] = fpPkHex;
        }
      });

      return pairs;
    } catch (error) {
      logger.error(new Error("Failed to map existing BSN+FP pairs"), {
        data: { error: String(error) },
      });
      return {};
    }
  }, [
    formData?.originalDelegation?.finalityProviderBtcPksHex,
    getRegisteredFinalityProvider,
    logger,
  ]);

  // Initialize form data when modal opens
  useEffect(() => {
    if (open && formData && !formData.feeRate) {
      const updatedFormData: StakingExpansionFormData = {
        ...formData,
        feeRate: defaultFeeRate,
        // Only set stakingTimelock if we have a default value (fixed term mode)
        // In variable term mode, user must explicitly choose the term
        stakingTimelock: defaultStakingTimeBlocks || formData.stakingTimelock,
      };
      setFormData(updatedFormData);
    }
  }, [open, formData, defaultFeeRate, defaultStakingTimeBlocks, setFormData]);

  // Initialize modal data loading when opened
  useEffect(() => {
    if (open) {
      // Start with BSN modal for expansion flow
      setStakingModalPage(StakingModalPage.BSN);
    } else {
      setStakingModalPage(StakingModalPage.DEFAULT);
      setSelectedBsnId(undefined);
    }
  }, [open, setStakingModalPage, setSelectedBsnId]);

  const handleClose = useCallback(() => {
    reset();
    setSelectedBsnFps({});
    setStakingModalPage(StakingModalPage.DEFAULT);
    setSelectedBsnId(undefined);
    onClose();
  }, [reset, onClose, setStakingModalPage, setSelectedBsnId]);

  // BSN selection handler - triggers FP modal
  const handleBsnSelect = useCallback(
    (bsnId: string) => {
      setSelectedBsnId(bsnId);
    },
    [setSelectedBsnId],
  );

  // Move to FP selection for the selected BSN
  const handleBsnNext = useCallback(() => {
    setStakingModalPage(StakingModalPage.FINALITY_PROVIDER);
  }, [setStakingModalPage]);

  // Return to BSN selection from FP modal
  const handleFpBack = useCallback(() => {
    setStakingModalPage(StakingModalPage.BSN);
  }, [setStakingModalPage]);

  // Add BSN+FP pair and return to BSN selection
  const handleFpAdd = useCallback(
    (bsnId: string, fpPkHex: string) => {
      setSelectedBsnFps((prev) => ({
        ...prev,
        [bsnId]: fpPkHex,
      }));
      // Return to BSN selection to add more or expand
      setStakingModalPage(StakingModalPage.BSN);
      setSelectedBsnId(undefined);
    },
    [setStakingModalPage, setSelectedBsnId],
  );

  // Remove BSN+FP pair
  const handleRemoveBsnFp = useCallback((bsnId: string) => {
    setSelectedBsnFps((prev) => {
      const newSelection = { ...prev };
      delete newSelection[bsnId];
      return newSelection;
    });
  }, []);

  const handleExpand = useCallback(async () => {
    if (!formData) return;

    // Check if UTXOs are still loading
    if (isUTXOsLoading) {
      handleError({
        error: new Error(
          "Please wait for wallet UTXOs to finish loading before expanding.",
        ),
        displayOptions: { showModal: true },
      });
      return;
    }

    // Calculate fee amount
    setIsCalculatingFee(true);
    try {
      const updatedFormData: StakingExpansionFormData = {
        ...formData,
        selectedBsnFps,
        feeRate: defaultFeeRate,
      };

      const feeAmount = await calculateExpansionFeeAmount(updatedFormData);
      const finalFormData: StakingExpansionFormData = {
        ...updatedFormData,
        feeAmount,
      };

      // Close the modal and go to preview
      handleClose();
      displayExpansionPreview(finalFormData);
    } catch (error) {
      handleError({
        error: error instanceof Error ? error : new Error(String(error)),
        displayOptions: { showModal: true },
      });
    } finally {
      setIsCalculatingFee(false);
    }
  }, [
    formData,
    selectedBsnFps,
    defaultFeeRate,
    calculateExpansionFeeAmount,
    displayExpansionPreview,
    handleClose,
    handleError,
    isUTXOsLoading,
  ]);

  // Don't render until we have form data
  if (!open || !formData) {
    return null;
  }

  const availableSlots = getAvailableBsnSlots();
  const selectedCount = Object.keys(selectedBsnFps).length;
  const canExpand =
    selectedCount > 0 && selectedCount <= availableSlots && !isUTXOsLoading;

  return (
    <Fragment>
      {/* Use dedicated ExpansionChainSelectionModal for BSN selection */}
      <ExpansionChainSelectionModal
        loading={bsnLoading}
        open={stakingModalPage === StakingModalPage.BSN}
        bsns={bsnList}
        selectedBsns={selectedBsnFps}
        existingBsns={existingBsnFps}
        onNext={handleBsnNext}
        onClose={handleClose}
        onSelect={handleBsnSelect}
        onRemove={handleRemoveBsnFp}
        onExpand={canExpand ? handleExpand : undefined}
        expandLoading={isCalculatingFee || isUTXOsLoading}
      />

      {/* Reuse existing FinalityProviderModal for FP selection */}
      <FinalityProviderModal
        selectedBsnId={selectedBsnId}
        open={stakingModalPage === StakingModalPage.FINALITY_PROVIDER}
        onClose={handleClose}
        onAdd={handleFpAdd}
        onBack={handleFpBack}
      />
    </Fragment>
  );
};
