import {
  Button,
  Card,
  Form,
  HiddenField,
  useFormState,
} from "@babylonlabs-io/core-ui";
import { useState } from "react";
import { AiOutlinePlus } from "react-icons/ai";

import { ResponsiveDialog } from "@/app/components/Modals/ResponsiveDialog";
import { ChainSelectionModal } from "@/app/components/Multistaking/ChainSelectionModal/ChainSelectionModal";
import { FinalityProviderModal } from "@/app/components/Multistaking/FinalityProviderModal/FinalityProviderModal";
import { AmountSubsection } from "@/app/components/Multistaking/MultistakingForm/AmountSubsection";
import { FeesSection } from "@/app/components/Multistaking/MultistakingForm/FeesSection";
import { SubSection } from "@/app/components/Multistaking/MultistakingForm/SubSection";
import { Section } from "@/app/components/Section/Section";
import {
  MultistakingState as MultistakingStateProvider,
  StakingModalPage,
  useMultistakingState,
} from "@/app/state/MultistakingState";
import { useStakingState } from "@/app/state/StakingState";
import { StakingModal } from "@/components/staking/StakingModal";
import { getNetworkConfigBTC } from "@/config/network/btc";

import { FinalityProviderItem } from "../FinalityProviderModal/FinalityProviderItem";

const { networkName } = getNetworkConfigBTC();

function MultistakingFormContent() {
  const { validationSchema, stakingInfo } = useStakingState();

  const {
    stakingModalPage,
    setStakingModalPage,
    selectedProviders,
    selectedChain,
    counter,
    handleSelectProvider,
    removeProvider,
    setSelectedChain,
    handlePreview,
    MAX_FINALITY_PROVIDERS,
  } = useMultistakingState();

  const [isModalOpen, setIsModalOpen] = useState(false);

  const PreviewSubmitButton = () => {
    const { isValid, errors } = useFormState();

    const errorKeys = Object.keys(errors);
    const errorMessages = errorKeys.map((key) => errors[key]?.message);

    return (
      <>
        {errorMessages.map((message, index) => (
          <div key={index} className="text-red-500 text-right">
            {message?.toString()}
          </div>
        ))}
        <Button
          //@ts-ignore - fix type issue in core-ui
          type="submit"
          className="w-full"
          style={{ marginTop: "8px" }}
          disabled={!isValid}
        >
          Preview
        </Button>
      </>
    );
  };

  return (
    <Section title={`${networkName} Staking`}>
      <Form
        schema={validationSchema}
        mode="onChange"
        reValidateMode="onChange"
        onSubmit={handlePreview}
      >
        <HiddenField
          name="term"
          defaultValue={stakingInfo?.defaultStakingTimeBlocks?.toString()}
        />
        <HiddenField name="feeRate" defaultValue="0" />
        <HiddenField name="feeAmount" defaultValue="0" />
        <HiddenField name="finalityProvider" defaultValue="" />
        <div className="flex flex-col gap-6 lg:flex-row">
          <Card className="flex-1 min-w-0 flex flex-col gap-2">
            <AmountSubsection />
            <SubSection>
              <div className="flex flex-col w-full" style={{ gap: "16px" }}>
                <div className="flex flex-row">
                  <div className="font-normal items-center flex flex-row justify-between w-full content-center">
                    View BSNs and Finality Provider
                  </div>
                  <div className="flex">
                    {counter < MAX_FINALITY_PROVIDERS && (
                      <div
                        className={`w-10 h-10 flex items-center justify-center rounded-md bg-primary-highlight border border-[#12495E] ${counter > 0 ? "rounded-r-none" : "rounded"} cursor-pointer`}
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
                        className={`px-4 h-10 flex items-center border border-[#12495E] ${counter === MAX_FINALITY_PROVIDERS ? "rounded-md" : "border-l-0 rounded-r-md"} cursor-pointer`}
                      >
                        {counter}/{MAX_FINALITY_PROVIDERS}
                      </div>
                    )}
                  </div>
                </div>
                {selectedProviders.map((provider, index) => (
                  <FinalityProviderItem
                    key={index}
                    provider={provider}
                    chainType={provider.chainType || selectedChain}
                    onRemove={() => removeProvider(index)}
                  />
                ))}
              </div>
            </SubSection>
            <FeesSection />
            <PreviewSubmitButton />
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
              onAdd={(selectedProviderKey) => {
                handleSelectProvider(selectedProviderKey);
                setIsModalOpen(false);
              }}
              onClose={() => setIsModalOpen(false)}
            />
          )}
        </ResponsiveDialog>

        <StakingModal />
      </Form>
    </Section>
  );
}

export function MultistakingForm() {
  return (
    <MultistakingStateProvider>
      <MultistakingFormContent />
    </MultistakingStateProvider>
  );
}
