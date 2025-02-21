import { Text } from "@babylonlabs-io/bbn-core-ui";
import { useState } from "react";
import { MdErrorOutline } from "react-icons/md";

import { InfoModal } from "@/app/components/Modals/InfoModal";
import { useStakingState } from "@/app/state/StakingState";
import { blocksToDisplayTime } from "@/utils/time";

export function InfoAlert() {
  const [showMore, setShowMore] = useState(false);
  const { stakingInfo } = useStakingState();

  return (
    <div className="rounded bg-secondary-highlight flex flex-row items-start justify-between py-2 px-4">
      <div className="py-2 pr-3">
        <MdErrorOutline size={22} className="text-secondary-strokeDark" />
      </div>

      <div className="flex flex-col gap-1 grow">
        <Text variant="subtitle1" className="font-medium text-accent-primary">
          Info
        </Text>
        <Text variant="body1" className="text-accent-secondary">
          You can unbond and withdraw your stake anytime with an unbonding time
          of {blocksToDisplayTime(stakingInfo?.unbondingTime)}.
        </Text>{" "}
        <a
          rel="noopener noreferrer"
          className="cursor-pointer text-secondary-main/90 hover:text-secondary-main"
          onClick={() => setShowMore(true)}
        >
          Learn More
        </a>
      </div>

      <InfoModal open={showMore} onClose={() => setShowMore(false)} />
    </div>
  );
}
