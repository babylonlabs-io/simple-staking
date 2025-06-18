import { FinalityProviderBsnState } from "@/ui/state/FinalityProviderBsnState";

import { FinalityProviders } from "./FinalityProviders";

export function FinalityProviderBsnWrapper() {
  return (
    <FinalityProviderBsnState>
      <FinalityProviders />
    </FinalityProviderBsnState>
  );
}
