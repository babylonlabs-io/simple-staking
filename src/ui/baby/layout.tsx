import { useWalletConnect } from "@babylonlabs-io/wallet-connector";
import { useEffect, useState } from "react";

import { DelegationState } from "@/ui/baby/state/DelegationState";
import { RewardState, useRewardState } from "@/ui/baby/state/RewardState";
import { StakingState } from "@/ui/baby/state/StakingState";
import { ValidatorState } from "@/ui/baby/state/ValidatorState";
import { AuthGuard } from "@/ui/common/components/Common/AuthGuard";
import { Container } from "@/ui/common/components/Container/Container";
import { Content } from "@/ui/common/components/Content/Content";
import { Section } from "@/ui/common/components/Section/Section";
import { Tabs } from "@/ui/common/components/Tabs";
import { useCosmosWallet } from "@/ui/common/context/wallet/CosmosWalletProvider";
import { useHealthCheck } from "@/ui/common/hooks/useHealthCheck";

import { BabyActivityList } from "./components/ActivityList";
import { RewardCard } from "./components/RewardCard";
import { RewardsPreviewModal } from "./components/RewardPreviewModal";
import { useEpochPolling } from "./hooks/api/useEpochPolling";
import { PendingOperationsProvider } from "./hooks/services/usePendingOperationsService";
import StakingForm from "./widgets/StakingForm";

type TabId = "stake" | "activity" | "rewards";

export default function BabyLayout() {
  const [activeTab, setActiveTab] = useState<TabId>("stake");
  const { connected } = useWalletConnect();
  const { isGeoBlocked, isLoading } = useHealthCheck();
  const { bech32Address } = useCosmosWallet();
  const isConnected = connected && !isGeoBlocked && !isLoading;

  return (
    <PendingOperationsProvider>
      <BabyLayoutContent
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isConnected={isConnected}
        bech32Address={bech32Address}
        connected={connected}
        isGeoBlocked={isGeoBlocked}
      />
    </PendingOperationsProvider>
  );
}

function BabyLayoutContent({
  activeTab,
  setActiveTab,
  isConnected,
  bech32Address,
  connected,
  isGeoBlocked,
}: {
  activeTab: TabId;
  setActiveTab: (tab: TabId) => void;
  isConnected: boolean;
  bech32Address: string | undefined;
  connected: boolean;
  isGeoBlocked: boolean;
}) {
  // Enable epoch polling to refetch delegations when epoch changes
  useEpochPolling(bech32Address);

  const RewardsTab: React.FC = () => {
    const {
      showClaimModal,
      closeClaimModal,
      claimAll,
      loading: rewardLoading,
      totalReward,
      rewards,
    } = useRewardState();

    return (
      <Section>
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
    );
  };

  useEffect(() => {
    if (!connected) {
      setActiveTab("stake");
    }
  }, [connected, setActiveTab]);

  useEffect(() => {
    if (isGeoBlocked && (activeTab === "activity" || activeTab === "rewards")) {
      setActiveTab("stake");
    }
  }, [isGeoBlocked, activeTab, setActiveTab]);

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
              <Section>
                <BabyActivityList />
              </Section>
            ),
          },
          {
            id: "rewards",
            label: "Rewards",
            content: <RewardsTab />,
          },
        ]
      : []),
  ];

  const fallbackTabItems = [
    {
      id: "stake",
      label: "Stake",
      content: <StakingForm />,
    },
  ];

  const fallbackContent = (
    <Container
      as="main"
      className="flex flex-col gap-[3rem] pb-16 max-w-[760px] mx-auto flex-1"
    >
      <Tabs items={fallbackTabItems} defaultActiveTab="stake" />
    </Container>
  );

  return (
    <StakingState>
      <ValidatorState>
        <DelegationState>
          <RewardState>
            <Content>
              <AuthGuard fallback={fallbackContent}>
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
