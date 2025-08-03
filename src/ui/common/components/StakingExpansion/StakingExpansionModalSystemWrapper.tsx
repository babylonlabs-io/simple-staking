import { FinalityProviderBsnState } from "@/ui/common/state/FinalityProviderBsnState";

import { StakingExpansionModalSystem } from "./StakingExpansionModalSystem";

export function StakingExpansionModalSystemWrapper() {
  return (
    <FinalityProviderBsnState>
      <StakingExpansionModalSystem />
    </FinalityProviderBsnState>
  );
}
