import {
  Button,
  DialogBody,
  DialogFooter,
  DialogHeader,
  Text,
} from "@babylonlabs-io/core-ui";

import { useLanguage } from "@/app/contexts/LanguageContext";
import { useNetworkInfo } from "@/app/hooks/client/api/useNetworkInfo";
import { translations } from "@/app/translations";
import { getNetworkConfigBTC } from "@/config/network/btc";
import { blocksToDisplayTime } from "@/utils/time";

import { ResponsiveDialog } from "./ResponsiveDialog";

interface InfoModalProps {
  open: boolean;
  onClose: () => void;
}

const { coinName } = getNetworkConfigBTC();

export function InfoModal({ open, onClose }: InfoModalProps) {
  const { data: networkInfo } = useNetworkInfo();
  const { language } = useLanguage();
  const t = translations[language];

  const unbondingTime = blocksToDisplayTime(
    networkInfo?.params.bbnStakingParams?.latestParam?.unbondingTime,
  );
  const maxStakingPeriod = blocksToDisplayTime(
    networkInfo?.params.bbnStakingParams?.latestParam?.maxStakingTimeBlocks,
  );

  return (
    <ResponsiveDialog open={open} onClose={onClose}>
      <DialogHeader
        title={t.stakeTimelockAndUnbonding}
        onClose={onClose}
        className="text-accent-primary"
      />
      <DialogBody className="flex flex-col pb-8 pt-4 text-accent-primary gap-4">
        <div className="py-4 flex flex-col items-start gap-4">
          <Text variant="body1">
            {t.stakeTimelockInfo
              .replace("{maxStakingPeriod}", maxStakingPeriod)
              .replace("{unbondingTime}", unbondingTime)}
          </Text>
          <Text variant="body1" className="text-accent-secondary italic">
            {t.stakeTimelockNote.replace("{coinName}", coinName)}
          </Text>
        </div>
      </DialogBody>
      <DialogFooter className="flex gap-4">
        <Button
          variant="contained"
          className="flex-1 text-xs sm:text-base"
          onClick={onClose}
        >
          {t.done}
        </Button>
      </DialogFooter>
    </ResponsiveDialog>
  );
}
