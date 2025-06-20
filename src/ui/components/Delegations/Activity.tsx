import { AuthGuard } from "@/ui/components/Common/AuthGuard";
import { DelegationList } from "@/ui/components/Delegations/DelegationList";
import { Section } from "@/ui/components/Section/Section";
import { FinalityProviderBsnState } from "@/ui/state/FinalityProviderBsnState";
import FeatureFlagService from "@/ui/utils/FeatureFlagService";

import { Delegations } from "./Delegations";

export function Activity() {
  const renderDelegationList = () => {
    if (FeatureFlagService.IsPhase3Enabled) {
      return (
        <FinalityProviderBsnState>
          <DelegationList />
        </FinalityProviderBsnState>
      );
    } else {
      return <DelegationList />;
    }
  };

  return (
    <AuthGuard>
      <Section title="Activity">
        <Delegations />
        {renderDelegationList()}
      </Section>
    </AuthGuard>
  );
}
