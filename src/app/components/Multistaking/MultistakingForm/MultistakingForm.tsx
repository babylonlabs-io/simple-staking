import { Card, Form, HiddenField } from "@babylonlabs-io/core-ui";
import { useCallback } from "react";
import { AiOutlinePlus } from "react-icons/ai";
import { twJoin } from "tailwind-merge";

import { ResponsiveDialog } from "@/app/components/Modals/ResponsiveDialog";
import { ChainSelectionModal } from "@/app/components/Multistaking/ChainSelectionModal/ChainSelectionModal";
import { FinalityProviderModal } from "@/app/components/Multistaking/FinalityProviderModal/FinalityProviderModal";
import { AmountSubsection } from "@/app/components/Multistaking/MultistakingForm/AmountSubsection";
import { FeesSection } from "@/app/components/Multistaking/MultistakingForm/FeesSection";
import { SubSection } from "@/app/components/Multistaking/MultistakingForm/SubSection";
import { Section } from "@/app/components/Section/Section";
import {
  StakingModalPage,
  StakingStep,
  useStakingState,
  type FormFields,
} from "@/app/state/StakingState";
import { StakingModal } from "@/components/staking/StakingModal";
import { getNetworkConfigBTC } from "@/config/network/btc";

import { FinalityProviderItem } from "../FinalityProviderModal/FinalityProviderItem";

import { PreviewButton } from "./PreviewButton";

const { networkName } = getNetworkConfigBTC();

export function MultistakingForm() {
  const {
    validationSchema,
    stakingInfo,
    setFormData,
    goToStep,
    isModalOpen,
    setIsModalOpen,
    stakingModalPage,
    setStakingModalPage,
    selectedProviders,
    selectedChain,
    setSelectedChain,
    handleSelectProvider,
    removeProvider,
    MAX_FINALITY_PROVIDERS,
  } = useStakingState();

  const counter = selectedProviders.length;

  const handlePreview = useCallback(
    (formValues: FormFields) => {
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
      >
        {stakingInfo && (
          <HiddenField
            name="term"
            defaultValue={(
              stakingInfo?.defaultStakingTimeBlocks ??
              stakingInfo?.minStakingTimeBlocks
            )?.toString()}
          />
        )}
        <HiddenField name="feeRate" defaultValue="0" />
        <HiddenField name="feeAmount" defaultValue="0" />
        <HiddenField name="finalityProvider" defaultValue="" />
        <div className="flex flex-col gap-6 lg:flex-row">
          <Card className="flex-1 min-w-0 flex flex-col gap-2">
            <AmountSubsection />
            <SubSection>
              <div className="flex flex-col w-full gap-4">
                <div className="flex flex-row">
                  <div className="font-normal items-center flex flex-row justify-between w-full content-center">
                    View BSNs and Finality Provider
                  </div>
                  <div className="flex">
                    {counter < MAX_FINALITY_PROVIDERS && (
                      <div
                        className={twJoin(
                          "w-10 h-10 flex items-center justify-center rounded-md bg-primary-highlight border border-accent-primary cursor-pointer",
                          counter > 0 ? "rounded-r-none" : "rounded",
                        )}
                        onClick={() => {
                          setStakingModalPage(
                            StakingModalPage.FINALITY_PROVIDER,
                          );
                          setIsModalOpen(true);
                        }}
                      >
                        <AiOutlinePlus size={20} />
                      </div>
                    )}
                    {0 < counter && 1 < MAX_FINALITY_PROVIDERS && (
                      <div
                        className={twJoin(
                          "px-4 h-10 flex items-center border border-accent-primary",
                          counter === MAX_FINALITY_PROVIDERS
                            ? "rounded-md"
                            : "border-l-0 rounded-r-md",
                          "cursor-pointer",
                        )}
                      >
                        {counter}/{MAX_FINALITY_PROVIDERS}
                      </div>
                    )}
                  </div>
                </div>
                {selectedProviders.map((provider) => (
                  <FinalityProviderItem
                    key={provider.id}
                    provider={provider}
                    chainType={provider.chainType || selectedChain}
                    onRemove={() => removeProvider(provider.id)}
                  />
                ))}
              </div>
            </SubSection>
            <FeesSection />
            <PreviewButton />
          </Card>
        </div>

        <ResponsiveDialog
          open={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          className="w-[52rem]"
        >
          {stakingModalPage === StakingModalPage.CHAIN_SELECTION && (
            <ChainSelectionModal
              onNext={(chain) => {
                setSelectedChain(chain);
                setStakingModalPage(StakingModalPage.FINALITY_PROVIDER);
              }}
              onClose={() => setIsModalOpen(false)}
            />
          )}
          {stakingModalPage === StakingModalPage.FINALITY_PROVIDER && (
            <FinalityProviderModal
              onAdd={(selectedProviderKey) =>
                handleSelectProvider(selectedProviderKey)
              }
              onClose={() => setIsModalOpen(false)}
            />
          )}
        </ResponsiveDialog>

        <StakingModal />
      </Form>
    </Section>
  );
}
