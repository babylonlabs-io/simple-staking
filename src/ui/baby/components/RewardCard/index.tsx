import { Avatar, Button, SubSection, Text } from "@babylonlabs-io/core-ui";

import { useRewardState } from "@/ui/baby/state/RewardState";
import { getNetworkConfigBBN } from "@/ui/common/config/network/bbn";
import { ubbnToBaby } from "@/ui/common/utils/bbn";
import { maxDecimals } from "@/ui/common/utils/maxDecimals";

const { logo, coinSymbol } = getNetworkConfigBBN();

export function RewardCard() {
  const { totalReward, openClaimModal, loading, refreshRewards } =
    useRewardState();

  const hasRewards = totalReward > 0n;
  const formattedReward = maxDecimals(ubbnToBaby(Number(totalReward)), 6);

  return (
    <SubSection className="flex-col gap-4">
      <div className="flex justify-between items-center w-full">
        <div className="inline-flex gap-2 items-center">
          <Avatar size="medium" url={logo} alt="BABY" />
          <span className="text-base sm:text-lg font-medium text-accent-primary">
            {coinSymbol}
          </span>
        </div>

        <Button
          size="small"
          onClick={refreshRewards}
          disabled={loading}
          variant="outlined"
          aria-label="Refresh rewards"
        >
          🔄
        </Button>
      </div>

      <Text
        as="div"
        variant="body2"
        className="flex justify-between items-center text-accent-secondary"
      >
        <span>Babylon Genesis</span>
        <span>
          {formattedReward} {coinSymbol}
        </span>
      </Text>

      <Button fluid onClick={openClaimModal} disabled={!hasRewards || loading}>
        Claim
      </Button>
    </SubSection>
  );
}
