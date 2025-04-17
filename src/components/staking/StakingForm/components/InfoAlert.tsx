import { Text } from "@babylonlabs-io/core-ui";
import { useState } from "react";

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
    <div className="rounded flex flex-row items-start justify-between">
      {/* <div className="py-2 pr-3">
        <MdErrorOutline size={22} className="text-secondary-strokeDark" />
      </div> */}

      <div className="flex flex-col gap-1 grow">
        <Text variant="subtitle1" className="font-medium text-accent-primary">
          {t.info}
        </Text>
        <Text variant="body1" className="text-accent-secondary">
          {t.unbondingInfo.replace(
            "{time}",
            blocksToDisplayTime(stakingInfo?.unbondingTime),
          )}{" "}
          <a
            rel="noopener noreferrer"
            className="cursor-pointer text-[#958263]/90 hover:text-[#958263]"
            onClick={() => setShowMore(true)}
          >
            {t.learnMore}
          </a>
        </Text>
      </div>

      <InfoModal open={showMore} onClose={() => setShowMore(false)} />
    </div>
  );
}
