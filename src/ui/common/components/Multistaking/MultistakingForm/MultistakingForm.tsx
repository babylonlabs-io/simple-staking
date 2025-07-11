import { Form, HiddenField } from "@babylonlabs-io/core-ui";
import { useCallback } from "react";

import { AuthGuard } from "@/ui/common/components/Common/AuthGuard";
import { BsnFinalityProviderField } from "@/ui/common/components/Multistaking/BsnFinalityProviderField/BsnFinalityProviderField";
import { AmountSubsection } from "@/ui/common/components/Multistaking/MultistakingForm/AmountSubsection";
import { FeesSection } from "@/ui/common/components/Multistaking/MultistakingForm/FeesSection";
import { MultistakingModal } from "@/ui/common/components/Multistaking/MultistakingModal/MultistakingModal";
import { useBTCWallet } from "@/ui/common/context/wallet/BTCWalletProvider";
import {
  useMultistakingState,
  type MultistakingFormFields,
} from "@/ui/common/state/MultistakingState";
import { StakingStep, useStakingState } from "@/ui/common/state/StakingState";
import FeatureFlagService from "@/ui/common/utils/FeatureFlagService";

import { ConnectButton } from "./ConnectButton";
import { FormAlert } from "./FormAlert";
import { SubmitButton } from "./SubmitButton";

export function MultistakingForm() {
  const { address } = useBTCWallet();
  const {
    stakingInfo,
    setFormData,
    goToStep,
    blocked: isGeoBlocked,
    errorMessage: geoBlockMessage,
  } = useStakingState();
  const { validationSchema, maxFinalityProviders } = useMultistakingState();

  const handlePreview = useCallback(
    (formValues: MultistakingFormFields) => {
      // Persist form values into global staking state
      // For multistaking, pass all selected finality providers
      setFormData({
        finalityProviders: Object.values(formValues.finalityProviders),
        term: Number(formValues.term),
        amount: Number(formValues.amount),
        feeRate: Number(formValues.feeRate),
        feeAmount: Number(formValues.feeAmount),
      });

      goToStep(StakingStep.PREVIEW);
    },
    [setFormData, goToStep],
  );

  if (!stakingInfo) {
    return null;
  }

  return (
    <Form
      schema={validationSchema}
      mode="onChange"
      reValidateMode="onChange"
      onSubmit={handlePreview}
    >
      {stakingInfo && (
        <HiddenField
          name="term"
          defaultValue={stakingInfo?.defaultStakingTimeBlocks?.toString()}
        />
      )}
      <HiddenField name="feeRate" defaultValue="0" />
      <HiddenField name="feeAmount" defaultValue="0" />
      <div className="flex flex-col gap-2">
        <BsnFinalityProviderField
          max={FeatureFlagService.IsPhase3Enabled ? maxFinalityProviders : 1}
        />
        <AmountSubsection />
        <FeesSection />

        <AuthGuard fallback={<ConnectButton />}>
          <SubmitButton />
        </AuthGuard>

        <FormAlert
          address={address}
          isGeoBlocked={isGeoBlocked}
          geoBlockMessage={geoBlockMessage}
        />
      </div>

      <MultistakingModal />
    </Form>
  );
}
