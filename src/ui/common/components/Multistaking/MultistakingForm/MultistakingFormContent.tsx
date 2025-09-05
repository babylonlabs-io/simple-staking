import { HiddenField } from "@babylonlabs-io/core-ui";

import { AuthGuard } from "@/ui/common/components/Common/AuthGuard";
import { MultistakingModal } from "@/ui/common/components/Multistaking/MultistakingModal/MultistakingModal";
import { useStakingState } from "@/ui/common/state/StakingState";

import { AmountSection } from "./AmountSection";
import { ConnectButton } from "./ConnectButton";
import { FinalityProvidersSection } from "./FinalityProvidersSection";
import { FormAlert } from "./FormAlert";
import { StakingFeesSection } from "./StakingFeesSection";
import { SubmitButton } from "./SubmitButton";

export function MultistakingFormContent() {
  const { stakingInfo, blocked: isGeoBlocked, disabled } = useStakingState();

  return (
    <>
      {stakingInfo && (
        <HiddenField
          name="term"
          defaultValue={stakingInfo?.defaultStakingTimeBlocks?.toString()}
        />
      )}

      <HiddenField name="feeRate" defaultValue="0" />
      <HiddenField name="feeAmount" defaultValue="0" />

      <div className="flex flex-col gap-2">
        <FinalityProvidersSection />
        <AmountSection />
        <StakingFeesSection />

        <AuthGuard fallback={<ConnectButton />} geoBlocked={isGeoBlocked}>
          <SubmitButton />
        </AuthGuard>

        <FormAlert {...disabled} />
      </div>

      <MultistakingModal />
    </>
  );
}
