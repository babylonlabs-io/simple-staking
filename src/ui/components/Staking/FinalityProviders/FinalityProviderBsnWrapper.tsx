import { FinalityProviderState } from "@/ui/state/FinalityProviderBsnState";

import { FinalityProviders } from "./FinalityProviders";

export function FinalityProviderBsnWrapper() {
  return (
    <FinalityProviderState>
      <FinalityProviders />
    </FinalityProviderState>
  );
}
