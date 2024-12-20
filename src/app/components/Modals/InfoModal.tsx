import {
  Button,
  Dialog,
  DialogBody,
  DialogFooter,
  DialogHeader,
  MobileDialog,
  Text,
} from "@babylonlabs-io/bbn-core-ui";

import { useNetworkInfo } from "@/app/hooks/client/api/useNetworkInfo";
import { useIsMobileView } from "@/app/hooks/useBreakpoint";
import { getNetworkConfig } from "@/config/network.config";
import { blocksToDisplayTime } from "@/utils/time";

interface InfoModalProps {
  open: boolean;
  onClose: () => void;
}

const { coinName } = getNetworkConfig();

export function InfoModal({ open, onClose }: InfoModalProps) {
  const { data: networkInfo } = useNetworkInfo();
  const isMobileView = useIsMobileView();
  const DialogComponent = isMobileView ? MobileDialog : Dialog;

  const unbondingTime = blocksToDisplayTime(
    networkInfo?.params.bbnStakingParams?.latestParam?.unbondingTime,
  );
  const maxStakingPeriod = blocksToDisplayTime(
    networkInfo?.params.bbnStakingParams?.latestParam?.maxStakingTimeBlocks,
  );

  return (
    <DialogComponent open={open} onClose={onClose}>
      <DialogHeader
        title="Stake Timelock and On-Demand Unbonding"
        onClose={onClose}
        className="text-primary-dark"
      />
      <DialogBody className="flex flex-col pb-8 pt-4 text-primary-dark gap-4">
        <div className="py-4 flex flex-col items-start gap-4">
          <Text variant="body1">
            Stakes made through this dashboard are locked for up to{" "}
            {maxStakingPeriod}. You can on-demand unbond at any time, with
            withdrawal available after a {unbondingTime} unbonding period. If
            the maximum staking period expires, your stake becomes withdrawable
            automatically, with no need for prior unbonding.
          </Text>
          <Text variant="body1" className="text-gray-500 italic">
            Note: Timeframes are approximate, based on an average {coinName}{" "}
            block time of 10 minutes.
          </Text>
        </div>
      </DialogBody>
      <DialogFooter className="flex gap-4">
        <Button
          variant="contained"
          className="flex-1 text-xs sm:text-base"
          onClick={onClose}
        >
          Done
        </Button>
      </DialogFooter>
    </DialogComponent>
  );
}
