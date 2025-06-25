import { Form, HiddenField } from "@babylonlabs-io/core-ui";
import { useCallback } from "react";

import { AuthGuard } from "@/ui/components/Common/AuthGuard";
import { ResponsiveDialog } from "@/ui/components/Modals/ResponsiveDialog";
import { BsnFinalityProviderField } from "@/ui/components/Multistaking/BsnFinalityProviderField/BsnFinalityProviderField";
import { ChainSelectionModal } from "@/ui/components/Multistaking/ChainSelectionModal/ChainSelectionModal";
import { FinalityProviderField } from "@/ui/components/Multistaking/FinalityProviderField/FinalityProviderField";
import { AmountSubsection } from "@/ui/components/Multistaking/MultistakingForm/AmountSubsection";
import { FeesSection } from "@/ui/components/Multistaking/MultistakingForm/FeesSection";
import { MultistakingModal } from "@/ui/components/Multistaking/MultistakingModal/MultistakingModal";
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
  const { stakingModalPage, setStakingModalPage } =
    useFinalityProviderBsnState();

  const handlePreview = useCallback(
    (formValues: MultistakingFormFields) => {
      // Persist form values into global staking state
      // For multistaking, pass all selected finality providers
      setFormData({
        finalityProvider: formValues.finalityProviders,
        term: Number(formValues.term),
        amount: Number(formValues.amount),
        feeRate: Number(formValues.feeRate),
        feeAmount: Number(formValues.feeAmount),
      });

      goToStep(StakingStep.PREVIEW);
    },
    [setFormData, goToStep],
  );

  const renderFinalityProviderField = () => {
    if (FeatureFlagService.IsPhase3Enabled) {
      return (
        <BsnFinalityProviderField
          open={stakingModalPage === StakingModalPage.BSN}
          max={maxFinalityProviders}
          onOpen={() => void setStakingModalPage(StakingModalPage.BSN)}
          onClose={() => void setStakingModalPage(StakingModalPage.DEFAULT)}
        />
      );
    } else {
      return (
        <FinalityProviderField
          open={stakingModalPage === StakingModalPage.FINALITY_PROVIDER}
          max={1}
          onOpen={() =>
            void setStakingModalPage(StakingModalPage.CHAIN_SELECTION)
          }
          onClose={() => void setStakingModalPage(StakingModalPage.DEFAULT)}
        />
      );
    }
  };

  if (!stakingInfo) {
    return null;
  }

  return (
    <Form
      // @ts-expect-error - React Hook Form wrapper in core-ui expects Yup schema from its own bundled version; casting to any to bypass duplicate dependency type mismatch.
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
  );
}
