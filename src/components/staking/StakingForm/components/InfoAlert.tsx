import { Text } from "@babylonlabs-io/core-ui";
import { useState } from "react";
import { MdErrorOutline } from "react-icons/md";

import { InfoModal } from "@/app/components/Modals/InfoModal";
import { useLanguage } from "@/app/contexts/LanguageContext";
import { useStakingState } from "@/app/state/StakingState";
import { translations } from "@/app/translations";
import { blocksToDisplayTime } from "@/utils/time";

export function InfoAlert() {
  const [showMore, setShowMore] = useState(false);
  const { stakingInfo } = useStakingState();
  const { language } = useLanguage();
  const t = translations[language];

  return (
    <div className="rounded bg-secondary-highlight flex flex-row items-start justify-between py-2 px-4">
      <div className="py-2 pr-3">
        <MdErrorOutline size={22} className="text-secondary-strokeDark" />
      </div>

      <div className="flex flex-col gap-1 grow">
        <Text variant="subtitle1" className="font-medium text-accent-primary">
          {t.info}
        </Text>
        <Text variant="body1" className="text-accent-secondary">
          {t.unbondingInfo.replace(
            "{time}",
            blocksToDisplayTime(stakingInfo?.unbondingTime),
          )}
        </Text>{" "}
        <a
          rel="noopener noreferrer"
          className="cursor-pointer text-secondary-main/90 hover:text-secondary-main"
          onClick={() => setShowMore(true)}
        >
          {t.learnMore}
        </a>
      </div>

      <InfoModal open={showMore} onClose={() => setShowMore(false)} />
    </div>
  );
}
