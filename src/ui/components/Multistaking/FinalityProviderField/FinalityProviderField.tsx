import { useField } from "@babylonlabs-io/core-ui";
import { useMemo } from "react";

import { CounterButton } from "@/ui/components/Multistaking/CounterButton";
import { FinalityProviderItem } from "@/ui/components/Multistaking/FinalityProviderField/FinalityProviderItem";
import { FinalityProviderModal } from "@/ui/components/Multistaking/FinalityProviderField/FinalityProviderModal";
import {
  StakingModalPage,
  useFinalityProviderBsnState,
} from "@/ui/state/FinalityProviderBsnState";

import { ChainSelectionModal } from "../ChainSelectionModal/ChainSelectionModal";
import { SubSection } from "../MultistakingForm/SubSection";

interface Props {
  max: number;
}

export function FinalityProviderField({ max }: Props) {
  const {
    bsnList,
    bsnLoading,
    stakingModalPage,
    finalityProviderMap,
    setStakingModalPage,
    setSelectedBsnId,
  } = useFinalityProviderBsnState();
  const { value: selectedFPs = [], onChange } = useField({
    name: "finalityProviders",
  });

  const selectedFP =
    Array.isArray(selectedFPs) && selectedFPs.length > 0 ? selectedFPs[0] : "";
  const counter = selectedFP ? 1 : 0;
  const selectedProvider = useMemo(
    () => finalityProviderMap.get(selectedFP),
    [selectedFP, finalityProviderMap],
  );

  function handleRemove() {
    onChange([]);
  }

  const handleOpen = () =>
    void setStakingModalPage(StakingModalPage.FINALITY_PROVIDER);
  const handleClose = () => void setStakingModalPage(StakingModalPage.DEFAULT);

  return (
    <SubSection>
      <div className="flex flex-col w-full gap-4">
        <div className="flex flex-row">
          <div className="font-normal items-center flex flex-row justify-between w-full content-center">
            Select Finality Provider
          </div>
          <CounterButton counter={counter} max={max} onAdd={handleOpen} />
        </div>
        {selectedProvider ? (
          <FinalityProviderItem
            provider={selectedProvider}
            onRemove={handleRemove}
          />
        ) : null}
      </div>

      <FinalityProviderModal
        selectedBsnId=""
        defaultFinalityProvider={selectedFP}
        open={stakingModalPage === StakingModalPage.FINALITY_PROVIDER}
        onAdd={(_, selectedProviderKey) => void onChange([selectedProviderKey])}
        onClose={handleClose}
      />

      <ChainSelectionModal
        open={stakingModalPage === StakingModalPage.BSN}
        bsns={bsnList}
        loading={bsnLoading}
        onNext={() => {
          // setSelectedChain(chain);
          setStakingModalPage(StakingModalPage.FINALITY_PROVIDER);
        }}
        onSelect={setSelectedBsnId}
        onClose={() => void setStakingModalPage(StakingModalPage.DEFAULT)}
      />
    </SubSection>
  );
}
