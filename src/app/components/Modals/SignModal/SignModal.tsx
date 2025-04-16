import {
  Button,
  DialogBody,
  DialogFooter,
  DialogHeader,
  Loader,
  Text,
} from "@babylonlabs-io/core-ui";

import { ResponsiveDialog } from "@/app/components/Modals/ResponsiveDialog";
import { useLanguage } from "@/app/contexts/LanguageContext";
import { translations } from "@/app/translations";
import { getNetworkConfigBBN } from "@/config/network/bbn";
import { getNetworkConfigBTC } from "@/config/network/btc";

import { Step } from "./Step";

interface SignModalProps {
  processing?: boolean;
  open: boolean;
  title: string;
  step: number;
  onClose?: () => void;
  onSubmit?: () => void;
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
}: SignModalProps) => {
  const { language } = useLanguage();
  const t = translations[language];

  return (
    <ResponsiveDialog open={open} onClose={onClose} hasBackdrop>
      <DialogHeader
        title={title}
        onClose={onClose}
        className="text-accent-primary"
      />

      <DialogBody className="flex flex-col pb-8 pt-4 text-accent-primary gap-4">
        <Text variant="body1" className="text-accent-secondary">
          {t.signMessages}
        </Text>

        <div className="py-4 flex flex-col items-start gap-6">
          <Step step={1} currentStep={step}>
            {t.consentToSlashing}
          </Step>
          <Step step={2} currentStep={step}>
            {t.consentToSlashingDuringUnbonding}
          </Step>
          <Step step={3} currentStep={step}>
            {t.addressBinding
              .replace("{coinSymbol}", coinSymbol)
              .replace("{bbnCoinSymbol}", bbnCoinSymbol)}
          </Step>
          <Step step={4} currentStep={step}>
            {t.stakingTransactionRegistration}
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
            {t.cancel}
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
              t.sign
            )}
          </Button>
        )}
      </DialogFooter>
    </ResponsiveDialog>
  );
};
