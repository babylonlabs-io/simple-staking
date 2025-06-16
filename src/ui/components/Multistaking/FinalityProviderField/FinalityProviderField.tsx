import { useField } from "@babylonlabs-io/core-ui";
import { useMemo } from "react";

import { CounterButton } from "@/ui/components/Multistaking/CounterButton";
import { FinalityProviderItem } from "@/ui/components/Multistaking/FinalityProviderField/FinalityProviderItem";
import { FinalityProviderModal } from "@/ui/components/Multistaking/FinalityProviderField/FinalityProviderModal";
import { useFinalityProviderState } from "@/ui/state/FinalityProviderState";

import { SubSection } from "../MultistakingForm/SubSection";

interface Props {
  open: boolean;
  max: number;
  disabled?: boolean;
  defaultValue?: string;
  onOpen: () => void;
  onClose: () => void;
}

export function FinalityProviderField({
  disabled = false,
  max,
  defaultValue,
  open,
  onOpen,
  onClose,
}: Props) {
  const { finalityProviderMap } = useFinalityProviderState();
  const { value: selectedFP, onChange } = useField({
    name: "finalityProvider",
    defaultValue,
    disabled,
  });

  const counter = selectedFP ? 1 : 0;
  const selectedProvider = useMemo(
    () => finalityProviderMap.get(selectedFP),
    [selectedFP, finalityProviderMap],
  );

  function handleRemove() {
    onChange("");
  }

  return (
    <SubSection>
      <div className="flex flex-col w-full gap-4">
        <div className="flex flex-row">
          <div className="font-normal items-center flex flex-row justify-between w-full content-center">
            Select Finality Provider
          </div>
          <CounterButton counter={counter} max={max} onAdd={onOpen} />
        </div>
        {selectedProvider ? (
          <FinalityProviderItem
            provider={selectedProvider}
            onRemove={handleRemove}
          />
        ) : null}
      </div>

      <FinalityProviderModal
        defaultFinalityProvider={selectedFP}
        open={open}
        onAdd={(selectedProviderKey) => void onChange(selectedProviderKey)}
        onClose={onClose}
      />
    </SubSection>
  );
}
