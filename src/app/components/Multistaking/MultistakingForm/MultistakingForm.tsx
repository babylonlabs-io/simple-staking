import { Card, Form, HiddenField } from "@babylonlabs-io/core-ui";
import { AiOutlinePlus } from "react-icons/ai";
import { twJoin } from "tailwind-merge";

import { ResponsiveDialog } from "@/app/components/Modals/ResponsiveDialog";
import { ChainSelectionModal } from "@/app/components/Multistaking/ChainSelectionModal/ChainSelectionModal";
import { FinalityProviderModal } from "@/app/components/Multistaking/FinalityProviderModal/FinalityProviderModal";
import { AmountSubsection } from "@/app/components/Multistaking/MultistakingForm/AmountSubsection";
import { FeesSection } from "@/app/components/Multistaking/MultistakingForm/FeesSection";
import { SubSection } from "@/app/components/Multistaking/MultistakingForm/SubSection";
import { Section } from "@/app/components/Section/Section";
import { useStakingState } from "@/app/state/StakingState";
import {
  StakingModalPage,
  useMultistakingState,
} from "@/app/state/StakingV2State";
import { StakingModal } from "@/components/staking/StakingModal";
import { getNetworkConfigBTC } from "@/config/network/btc";

import { FinalityProviderItem } from "../FinalityProviderModal/FinalityProviderItem";

import { PreviewButton } from "./PreviewButton";

const { networkName } = getNetworkConfigBTC();

export function MultistakingForm() {
  const { validationSchema, stakingInfo } = useStakingState();

  const {
    isModalOpen,
    setIsModalOpen,
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
                        className={twJoin(
                          "px-4 h-10 flex items-center border border-[#12495E]",
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
