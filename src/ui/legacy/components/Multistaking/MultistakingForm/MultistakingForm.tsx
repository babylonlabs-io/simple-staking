import { Card, Form, HiddenField } from "@babylonlabs-io/core-ui";
import { useCallback } from "react";

import { AuthGuard } from "@/ui/legacy/components/Common/AuthGuard";
import { BsnFinalityProviderField } from "@/ui/legacy/components/Multistaking/BsnFinalityProviderField/BsnFinalityProviderField";
import { AmountSubsection } from "@/ui/legacy/components/Multistaking/MultistakingForm/AmountSubsection";
import { FeesSection } from "@/ui/legacy/components/Multistaking/MultistakingForm/FeesSection";
import { MultistakingModal } from "@/ui/legacy/components/Multistaking/MultistakingModal/MultistakingModal";
import { Section } from "@/ui/legacy/components/Section/Section";
import { getNetworkConfigBTC } from "@/ui/legacy/config/network/btc";
import { useBTCWallet } from "@/ui/legacy/context/wallet/BTCWalletProvider";
import {
  useMultistakingState,
  type MultistakingFormFields,
} from "@/ui/legacy/state/MultistakingState";
import { StakingStep, useStakingState } from "@/ui/legacy/state/StakingState";

import { ConnectButton } from "./ConnectButton";
import { FormAlert } from "./FormAlert";
import { SubmitButton } from "./SubmitButton";

const { networkName } = getNetworkConfigBTC();

export function MultistakingForm() {
  const { address } = useBTCWallet();
  const {
    stakingInfo,
    setFormData,
    goToStep,
    blocked: isGeoBlocked,
    errorMessage: geoBlockMessage,
  } = useStakingState();
  const { validationSchema } = useMultistakingState();

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
    <Section title={`${networkName} staking for Babylon Genesis`}>
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
        <div className="flex flex-col gap-6 lg:flex-row">
          <Card className="flex-1 min-w-0 flex flex-col gap-2">
            {/* Legacy UI only support single FP staking */}
            <BsnFinalityProviderField max={1} />
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
          </Card>
        </div>

        <MultistakingModal />
      </Form>
    </Section>
  );
}
