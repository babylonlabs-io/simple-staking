import {
  Button,
  DialogBody,
  DialogFooter,
  DialogHeader,
  Text,
} from "@babylonlabs-io/core-ui";

import { ResponsiveDialog } from "@/ui/common/components/Modals/ResponsiveDialog";
import { useRenewTimelockModalState } from "@/ui/common/hooks/useRenewTimelockModalState";

interface RenewTimelockModalProps {
  open: boolean;
  onClose: () => void;
}

export const RenewTimelockModal = ({
  open,
  onClose,
}: RenewTimelockModalProps) => {
  const {
    feeCalculationError,
    newStakingTimeBlocks,
    stakingEndInfo,
    isLoadingParams,
    paramsError,
    handleExtend,
    buttonText,
    isButtonDisabled,
  } = useRenewTimelockModalState(open);

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

          {feeCalculationError && (
            <div className="bg-error-light border border-error rounded-lg p-4">
              <Text variant="body2" className="text-error">
                {feeCalculationError}
              </Text>
            </div>
          )}

          {paramsError && (
            <div className="bg-info-light border border-info rounded-lg p-4">
              <Text variant="body2" className="text-info">
                {paramsError}
              </Text>
            </div>
          )}

          {!newStakingTimeBlocks && !isLoadingParams && (
            <div className="bg-warning-light border border-warning rounded-lg p-4">
              <Text variant="body2" className="text-warning">
                Unable to load staking parameters. This may be due to a network
                issue or a problem retrieving data from the backend. Please try
                again later.
              </Text>
            </div>
          )}
        </div>
      </DialogBody>
      <DialogFooter className="flex gap-4">
        <Button variant="outlined" onClick={onClose} className="flex-1">
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleExtend}
          disabled={isButtonDisabled}
          className="flex-1"
        >
          {buttonText}
        </Button>
      </DialogFooter>
    </ResponsiveDialog>
  );
};
