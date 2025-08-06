import {
  Button,
  DialogBody,
  DialogFooter,
  DialogHeader,
  Heading,
  Text,
} from "@babylonlabs-io/core-ui";

import babylon from "@/infrastructure/babylon";
import { ValidatorItem } from "@/ui/baby/components/ValidatorItem";
import { ResponsiveDialog } from "@/ui/common/components/Modals/ResponsiveDialog";
import { getNetworkConfigBBN } from "@/ui/common/config/network/bbn";
import { maxDecimals } from "@/ui/common/utils/maxDecimals";

interface StakeData {
  amount: number;
  feeAmount: number;
  validator: {
    address: string;
    name: string;
    url?: string;
  };
}

interface PreviewModalProps {
  open?: boolean;
  loading?: boolean;
  data: StakeData;
  onClose?: () => void;
  onSubmit?: () => void;
}

const { coinSymbol } = getNetworkConfigBBN();

export const PreviewModal = ({
  open,
  loading,
  onClose,
  onSubmit,
  data,
}: PreviewModalProps) => {
  if (!data) return null;
  const { amount, feeAmount, validator } = data;
  const babyAmount = babylon.utils.ubbnToBaby(BigInt(amount));
  const babyFeeAmount = babylon.utils.ubbnToBaby(BigInt(feeAmount));

  return (
    <ResponsiveDialog open={open} onClose={onClose}>
      <DialogHeader
        title="Preview"
        onClose={onClose}
        className="text-accent-primary"
      />
      <DialogBody className="no-scrollbar mb-8 mt-4 flex flex-col gap-4 overflow-y-auto text-accent-primary">
        <div className="rounded border border-secondary-strokeLight px-6 pb-6">
          <Text variant="caption" className="text-accent-secondary p-4">
            Validator
          </Text>
          <div className="bg-secondary-highlight rounded p-4">
            <ValidatorItem
              logoUrl={validator?.url}
              name={validator?.name}
              size="small"
            />
          </div>
        </div>

        <div className="flex flex-col">
          <div className="flex flex-row items-center justify-between py-3">
            <Text variant="body1" className="text-secondary font-normal">
              Stake Amount
            </Text>
            <Text variant="body1" className="text-right font-normal">
              {maxDecimals(babyAmount, 6)} {coinSymbol}
            </Text>
          </div>

          <div className="flex flex-row items-center justify-between py-3">
            <Text variant="body1" className="text-secondary font-normal">
              Transaction Fees
            </Text>
            <Text variant="body1" className="text-right font-normal">
              {maxDecimals(babyFeeAmount, 6)} {coinSymbol}
            </Text>
          </div>
        </div>

        <div className="border-divider w-full border-t" />

        <div className="pt-2">
          <Heading variant="h6" className="text-primary mb-2">
            Attention!
          </Heading>
          <Text variant="body2" className="text-secondary">
            The staking transaction may take up to one (1) hour to process.
            Funds will not be deducted instantly; a sufficient available balance
            must be maintained until the transaction is confirmed and the
            deduction is finalized.
          </Text>
        </div>
      </DialogBody>

      <DialogFooter className="flex flex-col gap-4 pt-0 sm:flex-row">
        <Button
          variant="contained"
          color="primary"
          onClick={onSubmit}
          className="w-full sm:flex-1 sm:order-2"
          disabled={loading}
        >
          Stake
        </Button>
        <Button
          variant="outlined"
          color="primary"
          onClick={onClose}
          className="w-full sm:flex-1 sm:order-1"
        >
          Cancel
        </Button>
      </DialogFooter>
    </ResponsiveDialog>
  );
};
