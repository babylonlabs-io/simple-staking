import { Text } from "@babylonlabs-io/core-ui";

import { RewardCard } from "@/ui/baby/components/RewardCard";
import { useRewardService } from "@/ui/baby/hooks/services/useRewardService";
import { RouteGuard } from "@/ui/common/components/RouteGuard/RouteGuard";

export default function Rewards() {
  const { rewards, claimReward, loading } = useRewardService();

  return (
    <RouteGuard redirectTo="/baby/staking">
      <div className="flex flex-col gap-4">
        {rewards.length === 0 && !loading && (
          <Text variant="body1" className="text-accent-secondary">
            No rewards available.
          </Text>
        )}

        {rewards.map((reward) => (
          <RewardCard
            key={reward.validatorAddress}
            validatorName={reward.validatorAddress.slice(0, 8)}
            validatorAddress={reward.validatorAddress}
            amountBaby={Number(reward.amount) / 1e6}
            onClaim={() => claimReward(reward.validatorAddress)}
            disabled={loading}
          />
        ))}
      </div>
    </RouteGuard>
  );
}
