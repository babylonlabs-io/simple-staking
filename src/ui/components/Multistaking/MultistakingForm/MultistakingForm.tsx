import { Card, Form, HiddenField } from "@babylonlabs-io/core-ui";
import { useCallback } from "react";

import { ResponsiveDialog } from "@/ui/components/Modals/ResponsiveDialog";
import { ChainSelectionModal } from "@/ui/components/Multistaking/ChainSelectionModal/ChainSelectionModal";
import { FinalityProviderField } from "@/ui/components/Multistaking/FinalityProviderField/FinalityProviderField";
import { AmountSubsection } from "@/ui/components/Multistaking/MultistakingForm/AmountSubsection";
import { FeesSection } from "@/ui/components/Multistaking/MultistakingForm/FeesSection";
import { Section } from "@/ui/components/Section/Section";
import { StakingModal } from "@/ui/components/Staking/StakingModal";
import { getNetworkConfigBTC } from "@/ui/config/network/btc";
import { useBTCWallet } from "@/ui/context/wallet/BTCWalletProvider";
import {
  useMultistakingState,
  type MultistakingFormFields,
} from "@/ui/state/MultistakingState";
import {
  StakingModalPage,
  StakingStep,
  useStakingState,
} from "@/ui/state/StakingState";

import { FormAlert } from "./FormAlert";
import { PreviewButton } from "./PreviewButton";

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
  const {
    validationSchema,
    stakingModalPage,
    setStakingModalPage,
    setSelectedChain,
    MAX_FINALITY_PROVIDERS,
  } = useMultistakingState();

  const handlePreview = useCallback(
    (formValues: MultistakingFormFields) => {
      // Persist form values into global staking state
      setFormData({
        finalityProvider: formValues.finalityProvider,
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
    <Section title={`${networkName} Staking`}>
      <Form
        schema={validationSchema}
        mode="onChange"
        reValidateMode="onChange"
        onSubmit={handlePreview}
        onChange={(values) => console.log(values)}
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
            <FinalityProviderField
              open={stakingModalPage === StakingModalPage.FINALITY_PROVIDER}
              max={MAX_FINALITY_PROVIDERS}
              onOpen={() =>
                void setStakingModalPage(StakingModalPage.FINALITY_PROVIDER)
              }
              onClose={() => void setStakingModalPage(StakingModalPage.DEFAULT)}
            />
            <AmountSubsection />
            <FeesSection />
            <PreviewButton />
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
            onNext={(chain) => {
              setSelectedChain(chain);
              setStakingModalPage(StakingModalPage.FINALITY_PROVIDER);
            }}
            onClose={() => void setStakingModalPage(StakingModalPage.DEFAULT)}
          />
        </ResponsiveDialog>

        <StakingModal />
      </Form>
    </Section>
  );
}
