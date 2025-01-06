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
    <div className="rounded bg-[#F9F9F9] flex flex-row items-start justify-between py-2 px-4 text-primary-light">
      <div className="py-2 pr-3">
        <MdErrorOutline size={22} />
      </div>

      <div className="flex flex-col gap-1 grow">
        <Text variant="subtitle1" className="font-medium text-primary-dark">
          Info
        </Text>
        <Text variant="body1">
          You can unbond and withdraw your stake anytime with an unbonding time
          of {blocksToDisplayTime(stakingInfo?.unbondingTime)}.
        </Text>{" "}
        <a
          rel="noopener noreferrer"
          className="text-secondary-main hover:text-primary-main"
          onClick={() => setShowMore(true)}
        >
          Learn More
        </a>
      </div>

      <InfoModal open={showMore} onClose={() => setShowMore(false)} />
    </div>
  );
}
