import {
  Button,
  DialogBody,
  DialogFooter,
  DialogHeader,
  Text,
} from "@babylonlabs-io/core-ui";
import { PropsWithChildren } from "react";

import { ResponsiveDialog } from "@/ui/common/components/Modals/ResponsiveDialog";
import { getNetworkConfigBBN } from "@/ui/common/config/network/bbn";
import { ubbnToBaby } from "@/ui/common/utils/bbn";
import { maxDecimals } from "@/ui/common/utils/maxDecimals";

const { coinSymbol } = getNetworkConfigBBN();

interface PreviewModalProps {
  open: boolean;
  processing?: boolean;
  title: string;
  totalReward: bigint;
  onClose: () => void;
  onProceed: () => void;
}

export const RewardsPreviewModal = ({
  open,
  processing = false,
  title,
  totalReward,
  onClose,
  onProceed,
}: PropsWithChildren<PreviewModalProps>) => {
  const formattedReward = maxDecimals(ubbnToBaby(Number(totalReward)), 6);
  return (
    <ResponsiveDialog open={open} onClose={onClose}>
      <DialogHeader title={title} className="text-accent-primary" />

      <DialogBody className="no-scrollbar mb-[40px] mt-8 flex max-h-[calc(100vh-12rem)] flex-col gap-[40px] overflow-y-auto text-accent-primary">
        <div className="flex flex-col gap-4">
          <Text variant="body1" className="flex justify-between">
            <span>Babylon Genesis</span>
            <span className="flex flex-col items-end">
              {formattedReward} {coinSymbol}
            </span>
          </Text>

          <div className="border-divider w-full border-t" />

          <Text variant="body1" className="flex justify-between">
            <span>Transaction Fees</span>
            <span className="flex flex-col gap-2 items-end">
              <Text variant="body2">Network fees will be calculated</Text>
            </span>
          </Text>
        </div>
      </DialogBody>

      <DialogFooter className="flex flex-col gap-4 pt-0 sm:flex-row">
        <Button
          variant="contained"
          color="primary"
          onClick={onProceed}
          className="w-full sm:order-2 sm:flex-1"
          disabled={processing}
        >
          {processing ? "Processing..." : "Proceed"}
        </Button>
        <Button
          variant="outlined"
          color="primary"
          onClick={onClose}
          className="w-full sm:order-1 sm:flex-1"
        >
          Cancel
        </Button>
      </DialogFooter>
    </ResponsiveDialog>
  );
};
