import { useState } from "react";

import { InfoModal } from "@/app/components/Modals/InfoModal";
import { useStakingState } from "@/app/state/StakingState";
import { AlertBox, Button } from "@/ui";
import { blocksToDisplayTime } from "@/utils/time";

export function InfoAlert() {
  const [showMore, setShowMore] = useState(false);
  const { stakingInfo } = useStakingState();

  return (
    <AlertBox
      className="flex flex-row items-start justify-between"
      variant="neutral"
      showIcon={false}
      customizedContent={
        <>
          <div className="flex flex-col gap-1 grow">
            <h5 className="text-[16px] font-semibold font-mono">Please note</h5>
            <p className="text-callout font-mono text-pretty text-itemSecondaryDefault">
              You can unbond and withdraw your stake anytime with an unbonding
              time of {blocksToDisplayTime(stakingInfo?.unbondingTime)}.
            </p>
            <div className="mt-2">
              <Button
                size="sm"
                variant="text"
                color="secondary"
                rel="noopener noreferrer"
                className="cursor-pointer text-secondary-main/90 hover:text-secondary-main normal-case w-auto font-normal"
                onClick={() => setShowMore(true)}
              >
                Learn More
              </Button>
            </div>
          </div>

          <InfoModal open={showMore} onClose={() => setShowMore(false)} />
        </>
      }
    ></AlertBox>
  );
}
