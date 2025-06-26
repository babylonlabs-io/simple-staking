import { useField } from "@babylonlabs-io/core-ui";
import { useMemo } from "react";

import { BsnModal } from "@/ui/components/Multistaking/BsnFinalityProviderField/BsnModal";
import { SelectedProvidersList } from "@/ui/components/Multistaking/BsnFinalityProviderField/SelectedProvidersList";
import { CounterButton } from "@/ui/components/Multistaking/CounterButton";
import { FinalityProviderItem } from "@/ui/components/Multistaking/FinalityProviderField/FinalityProviderItem";
import { FinalityProviderModal } from "@/ui/components/Multistaking/FinalityProviderField/FinalityProviderModal";
import { useFinalityProviderBsnState } from "@/ui/state/FinalityProviderBsnState";
import FeatureFlagService from "@/ui/utils/FeatureFlagService";

import { SubSection } from "../MultistakingForm/SubSection";

interface Props {
  open: boolean;
  max: number;
  disabled?: boolean;
  onOpen: () => void;
  onClose: () => void;
}

export function FinalityProviderField({
  disabled = false,
  max,
  open,
  onOpen,
  onClose,
}: Props) {
  const { finalityProviderMap } = useFinalityProviderBsnState();

  const { value: selectedFPs, onChange } = useField({
    name: "finalityProviders",
    defaultValue: [],
    disabled,
  });

  // Phase 3 mode handlers
  const handleBsnAdd = (providerPk: string) => {
    onChange([...selectedFPs, providerPk]);
    onClose();
  };

  const handleBsnRemove = (btcPk: string) => {
    onChange(selectedFPs.filter((fpId: string) => fpId !== btcPk));
  };

  // Phase 2 mode handlers
  const selectedFP =
    Array.isArray(selectedFPs) && selectedFPs.length > 0 ? selectedFPs[0] : "";
  const selectedProvider = useMemo(
    () => finalityProviderMap.get(selectedFP),
    [selectedFP, finalityProviderMap],
  );

  function handleRegularRemove() {
    onChange([]);
  }

  const renderSelectedProviders = () => {
    if (FeatureFlagService.IsPhase3Enabled) {
      // Phase 3 mode: Show list of selected providers
      if (selectedFPs.length > 0) {
        return (
          <SelectedProvidersList
            providerIds={selectedFPs}
            onRemove={handleBsnRemove}
          />
        );
      }
    } else {
      // Phase 2 mode: Show single selected provider
      if (selectedProvider) {
        return (
          <FinalityProviderItem
            provider={selectedProvider}
            onRemove={handleRegularRemove}
          />
        );
      }
    }
    return null;
  };

  const renderModal = () => {
    if (FeatureFlagService.IsPhase3Enabled) {
      // Phase 3 mode: Use BsnModal
      if (open) {
        return (
          <BsnModal
            open={open}
            onAdd={handleBsnAdd}
            onClose={onClose}
            selectedProviderIds={selectedFPs}
          />
        );
      }
    } else {
      // Phase 2 mode: Use FinalityProviderModal
      return (
        <FinalityProviderModal
          defaultFinalityProvider={selectedFP}
          open={open}
          onAdd={(selectedProviderKey) => void onChange([selectedProviderKey])}
          onClose={onClose}
        />
      );
    }
    return null;
  };

  // Determine values based on feature flag
  let counter: number;
  let title: string;
  let alwaysShowCounter: boolean;

  if (FeatureFlagService.IsPhase3Enabled) {
    counter = selectedFPs.length;
    title = "Add BSN and Finality Provider";
    alwaysShowCounter = true;
  } else {
    counter = selectedFP ? 1 : 0;
    title = "Select Finality Provider";
    alwaysShowCounter = false;
  }

  return (
    <SubSection>
      <div className="flex flex-col w-full gap-4">
        <div className="flex flex-row">
          <div className="font-normal items-center flex flex-row justify-between w-full content-center">
            <span className="text-sm sm:text-base">{title}</span>
            <CounterButton
              counter={counter}
              max={max}
              onAdd={onOpen}
              alwaysShowCounter={alwaysShowCounter}
            />
          </div>
        </div>

        {renderSelectedProviders()}
      </div>

      {renderModal()}
    </SubSection>
  );
}
