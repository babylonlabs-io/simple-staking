import { EventData } from "@babylonlabs-io/btc-staking-ts";
import {
  Button,
  DialogBody,
  DialogFooter,
  DialogHeader,
  Loader,
  Text,
} from "@babylonlabs-io/core-ui";

import { ResponsiveDialog } from "@/ui/components/Modals/ResponsiveDialog";
import { getNetworkConfigBBN } from "@/ui/config/network/bbn";
import { getNetworkConfigBTC } from "@/ui/config/network/btc";

import { Step } from "./Step";

interface SignModalProps {
  processing?: boolean;
  open: boolean;
  title: string;
  step: number;
  onClose?: () => void;
  onSubmit?: () => void;
  options?: EventData;
}

const { coinSymbol } = getNetworkConfigBTC();
const { coinSymbol: bbnCoinSymbol } = getNetworkConfigBBN();

export const SignModal = ({
  processing = false,
  open,
  title,
  step,
  onClose,
  onSubmit,
  options,
}: SignModalProps) => (
  <ResponsiveDialog open={open} onClose={onClose} hasBackdrop>
    <DialogHeader
      title={title}
      onClose={onClose}
      className="text-accent-primary"
    />

    <DialogBody className="flex flex-col pb-8 pt-4 text-accent-primary gap-4">
      <Text variant="body1" className="text-accent-secondary">
        Please sign the following messages
      </Text>

      <div className="py-4 flex flex-col items-start gap-6">
        <Step step={1} currentStep={step} shouldShowDetails options={options}>
          Consent to slashing
        </Step>
        <Step step={2} currentStep={step} shouldShowDetails options={options}>
          Consent to slashing during unbonding
        </Step>
        <Step step={3} currentStep={step} shouldShowDetails options={options}>
          {coinSymbol}-{bbnCoinSymbol} address binding for receiving staking
          rewards
        </Step>
        {/* There are no details to show on staking transaction registration */}
        <Step step={4} currentStep={step}>
          Staking transaction registration
        </Step>
      </div>
    </DialogBody>

    <DialogFooter className="flex gap-4">
      {onClose && (
        <Button
          variant="outlined"
          color="primary"
          onClick={onClose}
          className="flex-1 text-xs sm:text-base"
        >
          Cancel
        </Button>
      )}

      {onSubmit && (
        <Button
          disabled={processing}
          variant="contained"
          className="flex-1 text-xs sm:text-base"
          onClick={onSubmit}
        >
          {processing ? (
            <Loader size={16} className="text-accent-contrast" />
          ) : (
            "Sign"
          )}
        </Button>
      )}
    </DialogFooter>
  </ResponsiveDialog>
);
