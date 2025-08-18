import { useCallback, useEffect, useMemo, useState } from "react";

import { useNetworkFees } from "@/ui/common/hooks/client/api/useNetworkFees";
import { useNetworkInfo } from "@/ui/common/hooks/client/api/useNetworkInfo";
import { useStakingExpansionService } from "@/ui/common/hooks/services/useStakingExpansionService";
import { useStakingExpansionState } from "@/ui/common/state/StakingExpansionState";
import { BbnStakingParamsVersion } from "@/ui/common/types/networkInfo";
import { getFeeRateFromMempool } from "@/ui/common/utils/getFeeRateFromMempool";
import { getTipHeight } from "@/ui/common/utils/mempool_api";
import { selectParamsForCurrentHeight } from "@/ui/common/utils/stakingExpansionParams";
import { blocksToDisplayTime } from "@/ui/common/utils/time";

interface RenewTimelockModalState {
  isCalculatingFee: boolean;
  feeCalculationError: string | null;
  newStakingTimeBlocks: number;
  stakingEndInfo: {
    blocks: number;
    displayTime: string;
  };
  isLoadingParams: boolean;
  paramsError: string | null;
  handleExtend: () => Promise<void>;
  buttonText: string;
  isButtonDisabled: boolean;
}

export function useRenewTimelockModalState(
  open: boolean,
): RenewTimelockModalState {
  const { formData, setFormData } = useStakingExpansionState();
  const { data: networkInfo } = useNetworkInfo();
  const { data: networkFees } = useNetworkFees();
  const { calculateExpansionFeeAmount, displayExpansionPreview } =
    useStakingExpansionService();

  const [isCalculatingFee, setIsCalculatingFee] = useState(false);
  const [feeCalculationError, setFeeCalculationError] = useState<string | null>(
    null,
  );
  const [currentBtcHeight, setCurrentBtcHeight] = useState<number | null>(null);
  const [isLoadingParams, setIsLoadingParams] = useState(false);
  const [paramsError, setParamsError] = useState<string | null>(null);

  const { defaultFeeRate } = getFeeRateFromMempool(networkFees);

  // Fetch current BTC height when modal opens
  useEffect(() => {
    if (open) {
      setIsLoadingParams(true);
      setParamsError(null);
      getTipHeight()
        .then((height) => {
          setCurrentBtcHeight(height);
          setIsLoadingParams(false);
        })
        .catch((error) => {
          console.error("Failed to fetch BTC tip height:", error);
          setParamsError(
            "Failed to fetch current Bitcoin block height. Using latest parameters as fallback.",
          );
          setIsLoadingParams(false);
        });
    }
  }, [open]);

  // Calculate the new staking timelock for renewal based on current BTC height
  const newStakingTimeBlocks = useMemo(() => {
    if (!networkInfo?.params.bbnStakingParams?.versions) {
      return 0;
    }

    let selectedParam: BbnStakingParamsVersion | null = null;

    if (currentBtcHeight !== null) {
      // Use height-based selection when we have the current height
      selectedParam = selectParamsForCurrentHeight(
        networkInfo.params.bbnStakingParams.versions,
        currentBtcHeight,
      );
    } else {
      // Fallback to latest param if we couldn't fetch the height
      selectedParam = networkInfo.params.bbnStakingParams.latestParam;
    }

    if (!selectedParam) {
      console.warn(
        "No valid staking parameters found for current block height",
      );
      return 0;
    }

    const { maxStakingTimeBlocks = 0 } = selectedParam;

    if (!maxStakingTimeBlocks) {
      console.warn(
        "Maximum staking time blocks not available for renewal. This may be due to a network issue or a problem retrieving staking parameters from the backend.",
      );
      return 0;
    }

    return maxStakingTimeBlocks;
  }, [networkInfo, currentBtcHeight]);

  // Update form data with the new timelock and fee rate when they're calculated
  useEffect(() => {
    if (
      open &&
      formData &&
      newStakingTimeBlocks > 0 &&
      (formData.stakingTimelock === 0 ||
        formData.stakingTimelock !== newStakingTimeBlocks)
    ) {
      setFormData({
        ...formData,
        stakingTimelock: newStakingTimeBlocks,
        feeRate: defaultFeeRate,
      });
    }
  }, [open, formData, newStakingTimeBlocks, defaultFeeRate, setFormData]);

  const handleExtend = useCallback(async () => {
    if (!formData) return;

    setIsCalculatingFee(true);
    setFeeCalculationError(null);
    try {
      // Ensure the timelock and fee rate are set before calculating fee
      const updatedFormData = {
        ...formData,
        stakingTimelock: formData.stakingTimelock || newStakingTimeBlocks,
        feeRate: formData.feeRate || defaultFeeRate,
      };

      // Calculate the fee for the renewal transaction
      const feeAmount = await calculateExpansionFeeAmount(updatedFormData);

      // Update with the calculated fee
      const finalFormData = {
        ...updatedFormData,
        feeAmount,
      };

      // Use displayExpansionPreview which will set the form data and go to preview
      displayExpansionPreview(finalFormData);
    } catch (error) {
      console.error("Failed to calculate renewal fee:", error);
      setFeeCalculationError(
        "Failed to calculate transaction fee. Please try again or contact support if the problem persists.",
      );
    } finally {
      setIsCalculatingFee(false);
    }
  }, [
    formData,
    newStakingTimeBlocks,
    defaultFeeRate,
    calculateExpansionFeeAmount,
    displayExpansionPreview,
  ]);

  // Calculate the staking duration and human-readable time
  const stakingEndInfo = useMemo(() => {
    const blocks = formData?.stakingTimelock || newStakingTimeBlocks;
    if (!blocks) return { blocks: 0, displayTime: "-" };

    const displayTime = blocksToDisplayTime(blocks);

    return {
      blocks,
      displayTime,
    };
  }, [formData?.stakingTimelock, newStakingTimeBlocks]);

  // Compute button text based on current state
  const buttonText = useMemo(() => {
    if (isLoadingParams) return "Loading...";
    if (isCalculatingFee) return "Calculating...";
    return "Extend";
  }, [isLoadingParams, isCalculatingFee]);

  // Compute button disabled state
  const isButtonDisabled =
    !newStakingTimeBlocks || isCalculatingFee || isLoadingParams;

  return {
    isCalculatingFee,
    feeCalculationError,
    newStakingTimeBlocks,
    stakingEndInfo,
    isLoadingParams,
    paramsError,
    handleExtend,
    buttonText,
    isButtonDisabled,
  };
}
