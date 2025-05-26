import { Button, Card, Form, useFormState } from "@babylonlabs-io/core-ui";
import { useState } from "react";
import { AiOutlinePlus } from "react-icons/ai";

import { ResponsiveDialog } from "@/app/components/Modals/ResponsiveDialog";
import { ChainSelectionModal } from "@/app/components/Multistaking/ChainSelectionModal/ChainSelectionModal";
import { FinalityProviderModal } from "@/app/components/Multistaking/FinalityProviderModal/FinalityProviderModal";
import { AmountSubsection } from "@/app/components/Multistaking/MultistakingForm/AmountSubsection";
import { DynamicHiddenFields } from "@/app/components/Multistaking/MultistakingForm/DynamicHiddenFields";
import { FeesSection } from "@/app/components/Multistaking/MultistakingForm/FeesSection";
import { FinalityProviderItem } from "@/app/components/Multistaking/MultistakingForm/FinalityProviderItem";
import { FormValuesConsumer } from "@/app/components/Multistaking/MultistakingForm/FormValuesConsumer";
import { SubSection } from "@/app/components/Multistaking/MultistakingForm/SubSection";
import { Section } from "@/app/components/Section/Section";
import { useFinalityProviderState } from "@/app/state/FinalityProviderState";
import { useStakingState } from "@/app/state/StakingState";
import { getNetworkConfigBTC } from "@/config/network/btc";

const { networkName } = getNetworkConfigBTC();

const MAX_FINALITY_PROVIDERS = 1;

enum StakingModalPage {
  CHAIN_SELECTION = 0,
  FINALITY_PROVIDER = 1,
}

export function MultistakingForm() {
  const { validationSchema, stakingInfo } = useStakingState();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [stakingModalPage, setStakingModalPage] = useState<StakingModalPage>(
    StakingModalPage.FINALITY_PROVIDER,
  );
  const [selectedProviders, setSelectedProviders] = useState<Array<any>>([]);
  const [selectedChain, setSelectedChain] = useState<string>("babylon");
  const [counter, setCounter] = useState(0);
  const { finalityProviders } = useFinalityProviderState();
  const [previewModalOpen, setPreviewModalOpen] = useState(false);

  const handleSelectProvider = (selectedProviderKey: string) => {
    if (selectedProviderKey) {
      const providerData = finalityProviders?.find(
        (provider) => provider.btcPk === selectedProviderKey,
      );
      if (providerData) {
        setSelectedProviders([
          ...selectedProviders,
          { ...providerData, chainType: selectedChain },
        ]);
        setCounter((prev) => prev + 1);
      }
    }
    setIsModalOpen(false);
  };

  const handlePreview = (data: any) => {
    setPreviewModalOpen(true);
  };

  const PreviewSubmitButton = () => {
    const { isValid, errors } = useFormState();

    return (
      <>
        {/* {errors.amount && <div className="text-red-500 text-right">{errors?.amount?.message}</div>} */}
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
        <DynamicHiddenFields stakingInfo={stakingInfo} />
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
                    onRemove={() => {
                      const updatedProviders = [...selectedProviders];
                      updatedProviders.splice(index, 1);
                      setSelectedProviders(updatedProviders);
                      setCounter(counter - 1);
                    }}
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
              onAdd={(selectedProviderKey) =>
                handleSelectProvider(selectedProviderKey)
              }
              onClose={() => setIsModalOpen(false)}
            />
          )}
        </ResponsiveDialog>

        <FormValuesConsumer
          selectedProviders={selectedProviders}
          previewModalOpen={previewModalOpen}
          setPreviewModalOpen={setPreviewModalOpen}
        />
      </Form>
    </Section>
  );
}
