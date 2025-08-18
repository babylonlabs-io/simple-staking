import {
  Button,
  DialogBody,
  DialogFooter,
  DialogHeader,
  Text,
} from "@babylonlabs-io/core-ui";
import { useCallback, useEffect, useMemo, useState } from "react";

import { ResponsiveDialog } from "@/ui/common/components/Modals/ResponsiveDialog";
import { useNetworkFees } from "@/ui/common/hooks/client/api/useNetworkFees";
import { useNetworkInfo } from "@/ui/common/hooks/client/api/useNetworkInfo";
import { useStakingExpansionService } from "@/ui/common/hooks/services/useStakingExpansionService";
import { useStakingExpansionState } from "@/ui/common/state/StakingExpansionState";
import { getFeeRateFromMempool } from "@/ui/common/utils/getFeeRateFromMempool";
import { blocksToDisplayTime } from "@/ui/common/utils/time";

interface RenewTimelockModalProps {
  open: boolean;
  onClose: () => void;
}

export const RenewTimelockModal = ({
  open,
  onClose,
}: RenewTimelockModalProps) => {
  const { formData, setFormData } = useStakingExpansionState();
  const { data: networkInfo } = useNetworkInfo();
  const { data: networkFees } = useNetworkFees();
  const { calculateExpansionFeeAmount, displayExpansionPreview } =
    useStakingExpansionService();
  const [isCalculatingFee, setIsCalculatingFee] = useState(false);

  const { defaultFeeRate } = getFeeRateFromMempool(networkFees);

  // Calculate the new staking timelock for renewal
  const newStakingTimeBlocks = useMemo(() => {
    const latestParam = networkInfo?.params.bbnStakingParams?.latestParam;
    if (!latestParam) {
      return 0;
    }

    const { maxStakingTimeBlocks = 0 } = latestParam;

    if (!maxStakingTimeBlocks) {
      throw new Error("Maximum staking time blocks not available for renewal");
    }

    return maxStakingTimeBlocks;
  }, [networkInfo]);

  // Update form data with the new timelock and fee rate when they're calculated
  useEffect(() => {
    if (
      open &&
      formData &&
      newStakingTimeBlocks > 0 &&
      formData.stakingTimelock === 0
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

  return (
    <ResponsiveDialog open={open} onClose={onClose}>
      <DialogHeader
        title="Renew Staking Term"
        onClose={onClose}
        className="text-accent-primary"
      />
      <DialogBody className="flex flex-col gap-6 py-6 text-accent-primary">
        <div className="flex flex-col gap-4">
          <Text variant="body1" className="text-secondary">
            Extend your current stake’s duration without needing to unbond or
            restake. This helps maintain your position and continue securing
            networks without interruption. Your staking term will reset, and the
            change will take effect after it’s confirmed on the Bitcoin network.
          </Text>

          <div className="bg-primary-contrast rounded-lg p-4">
            <div className="flex justify-between items-start">
              <Text variant="body1" className="text-secondary">
                Staking Term End Date
              </Text>
              <div className="text-right">
                <Text
                  variant="body1"
                  className="font-semibold text-accent-primary"
                >
                  {stakingEndInfo.blocks.toLocaleString()} Blocks
                </Text>
                <Text variant="caption" className="text-secondary block mt-1">
                  ~ {stakingEndInfo.displayTime}
                </Text>
              </div>
            </div>
          </div>
        </div>
      </DialogBody>
      <DialogFooter className="flex gap-4">
        <Button variant="outlined" onClick={onClose} className="flex-1">
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleExtend}
          disabled={!newStakingTimeBlocks || isCalculatingFee}
          className="flex-1"
        >
          {isCalculatingFee ? "Calculating..." : "Extend"}
        </Button>
      </DialogFooter>
    </ResponsiveDialog>
  );
};
