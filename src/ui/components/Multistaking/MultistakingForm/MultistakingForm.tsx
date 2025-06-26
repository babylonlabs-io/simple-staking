import { Card, Form, HiddenField } from "@babylonlabs-io/core-ui";
import { useCallback } from "react";

import { AuthGuard } from "@/ui/components/Common/AuthGuard";
import { ResponsiveDialog } from "@/ui/components/Modals/ResponsiveDialog";
import { ChainSelectionModal } from "@/ui/components/Multistaking/ChainSelectionModal/ChainSelectionModal";
import { FinalityProviderField } from "@/ui/components/Multistaking/FinalityProviderField/FinalityProviderField";
import { AmountSubsection } from "@/ui/components/Multistaking/MultistakingForm/AmountSubsection";
import { FeesSection } from "@/ui/components/Multistaking/MultistakingForm/FeesSection";
import { MultistakingModal } from "@/ui/components/Multistaking/MultistakingModal/MultistakingModal";
import { Section } from "@/ui/components/Section/Section";
import { getNetworkConfigBTC } from "@/ui/config/network/btc";
import { useBTCWallet } from "@/ui/context/wallet/BTCWalletProvider";
import { useFinalityProviderBsnState } from "@/ui/state/FinalityProviderBsnState";
import {
  useMultistakingState,
  type MultistakingFormFields,
} from "@/ui/state/MultistakingState";
import {
  StakingModalPage,
  StakingStep,
  useStakingState,
} from "@/ui/state/StakingState";
import FeatureFlagService from "@/ui/utils/FeatureFlagService";

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
  const { validationSchema, maxFinalityProviders } = useMultistakingState();
  const { stakingModalPage, setStakingModalPage, setSelectedBsnId } =
    useFinalityProviderBsnState();

  const handlePreview = useCallback(
    (formValues: MultistakingFormFields) => {
      // Persist form values into global staking state
      // For multistaking, pass all selected finality providers
      setFormData({
        finalityProviders: formValues.finalityProviders,
        term: Number(formValues.term),
        amount: Number(formValues.amount),
        feeRate: Number(formValues.feeRate),
        feeAmount: Number(formValues.feeAmount),
      });

      goToStep(StakingStep.PREVIEW);
    },
    [setFormData, goToStep],
  );

  const handleFinalityProviderOpen = useCallback(() => {
    if (FeatureFlagService.IsPhase3Enabled) {
      // Phase 3 mode: Open BSN modal
      setStakingModalPage(StakingModalPage.BSN);
    } else {
      // Phase 2 mode: Reset BSN selection and open finality provider modal
      setSelectedBsnId("");
      setStakingModalPage(StakingModalPage.FINALITY_PROVIDER);
    }
  }, [setStakingModalPage, setSelectedBsnId]);

  const renderFinalityProviderField = () => {
    let modalPage: StakingModalPage;
    let max: number;

    if (FeatureFlagService.IsPhase3Enabled) {
      modalPage = StakingModalPage.BSN;
      max = maxFinalityProviders;
    } else {
      modalPage = StakingModalPage.FINALITY_PROVIDER;
      max = 1;
    }

    return (
      <FinalityProviderField
        open={stakingModalPage === modalPage}
        max={max}
        onOpen={handleFinalityProviderOpen}
        onClose={() => void setStakingModalPage(StakingModalPage.DEFAULT)}
      />
    );
  };

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
            {renderFinalityProviderField()}
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

        <ResponsiveDialog
          open={stakingModalPage === StakingModalPage.CHAIN_SELECTION}
          onClose={() => void setStakingModalPage(StakingModalPage.DEFAULT)}
          className="w-[52rem]"
        >
          <ChainSelectionModal
            onNext={() => {
              // setSelectedChain(chain);
              setStakingModalPage(StakingModalPage.FINALITY_PROVIDER);
            }}
            onClose={() => void setStakingModalPage(StakingModalPage.DEFAULT)}
          />
        </ResponsiveDialog>

        <MultistakingModal />
      </Form>
    </Section>
  );
}
