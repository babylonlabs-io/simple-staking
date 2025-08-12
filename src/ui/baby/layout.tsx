import { useWalletConnect } from "@babylonlabs-io/wallet-connector";
import { useEffect, useState } from "react";

import { DelegationState } from "@/ui/baby/state/DelegationState";
import { RewardState } from "@/ui/baby/state/RewardState";
import { StakingState } from "@/ui/baby/state/StakingState";
import { ValidatorState } from "@/ui/baby/state/ValidatorState";
import { AuthGuard } from "@/ui/common/components/Common/AuthGuard";
import { Container } from "@/ui/common/components/Container/Container";
import { Content } from "@/ui/common/components/Content/Content";
import { Section } from "@/ui/common/components/Section/Section";
import { Tabs } from "@/ui/common/components/Tabs";
import { useHealthCheck } from "@/ui/common/hooks/useHealthCheck";

import { BabyActivityList } from "./components/ActivityList";
import { RewardCard } from "./components/RewardCard";
import { RewardsPreviewModal } from "./components/RewardPreviewModal";
import { useRewardState } from "./state/RewardState";
import StakingForm from "./widgets/StakingForm";

type TabId = "stake" | "activity" | "rewards";

export default function BabyLayout() {
  const [activeTab, setActiveTab] = useState<TabId>("stake");
  const { connected } = useWalletConnect();
  const { isGeoBlocked, isLoading } = useHealthCheck();
  const isConnected = connected && !isGeoBlocked && !isLoading;

  const {
    showClaimModal,
    closeClaimModal,
    claimAll,
    loading: rewardLoading,
    totalReward,
    rewards,
  } = useRewardState();

  useEffect(() => {
    if (!connected) {
      setActiveTab("stake");
    }
  }, [connected]);

  useEffect(() => {
    if (isGeoBlocked && (activeTab === "activity" || activeTab === "rewards")) {
      setActiveTab("stake");
    }
  }, [isGeoBlocked, activeTab]);

  const tabItems = [
    {
      id: "stake",
      label: "Stake",
      content: <StakingForm />,
    },
    ...(isConnected
      ? [
          {
            id: "activity",
            label: "Activity",
            content: (
              <Section title="Activity" titleClassName="md:text-[1.25rem]">
                <BabyActivityList />
              </Section>
            ),
          },
          {
            id: "rewards",
            label: "Rewards",
            content: (
              <Section title="Rewards" titleClassName="md:text-[1.25rem]">
                <div className="h-[500px]">
                  <RewardCard />
                  <RewardsPreviewModal
                    open={showClaimModal}
                    processing={rewardLoading}
                    title="Claim Rewards"
                    totalReward={totalReward}
                    rewards={rewards}
                    onClose={closeClaimModal}
                    onProceed={claimAll}
                  />
                </div>
              </Section>
            ),
          },
        ]
      : []),
  ];

  return (
    <StakingState>
      <ValidatorState>
        <DelegationState>
          <RewardState>
            <Content>
              <AuthGuard>
                <Container
                  as="main"
                  className="flex flex-col gap-[3rem] pb-16 max-w-[760px] mx-auto flex-1"
                >
                  <Tabs
                    items={tabItems}
                    defaultActiveTab="stake"
                    activeTab={activeTab}
                    onTabChange={(tabId) => setActiveTab(tabId as TabId)}
                  />
                </Container>
              </AuthGuard>
            </Content>
          </RewardState>
        </DelegationState>
      </ValidatorState>
    </StakingState>
  );
}
