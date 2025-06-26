import { useField } from "@babylonlabs-io/core-ui";
import { useEffect } from "react";

import { CounterButton } from "@/ui/components/Multistaking/CounterButton";
import { useFinalityProviderBsnState } from "@/ui/state/FinalityProviderBsnState";

import { SubSection } from "../MultistakingForm/SubSection";

import { BsnModal } from "./BsnModal";
import { SelectedProvidersList } from "./SelectedProvidersList";

interface Props {
  open: boolean;
  max: number;
  disabled?: boolean;
  defaultValue?: string[]; // Store FP IDs
  onOpen: () => void;
  onClose: () => void;
}

export function BsnFinalityProviderField({
  disabled = false,
  max,
  defaultValue = [],
  open,
  onOpen,
  onClose,
}: Props) {
  const { value: selectedProviderIds, onChange } = useField<string[]>({
    name: "finalityProviders",
    defaultValue,
    disabled,
  });

  const { selectedFinalityProviderIds, setSelectedFinalityProviderIds } =
    useFinalityProviderBsnState();

  // Synchronize selectedFinalityProviderIds with selectedProviderIds
  useEffect(() => {
    const currentSet = new Set(selectedProviderIds);
    const stateSet = selectedFinalityProviderIds;

    // Only update if the sets are different
    if (
      currentSet.size !== stateSet.size ||
      !Array.from(currentSet).every((id) => stateSet.has(id))
    ) {
      setSelectedFinalityProviderIds(currentSet);
    }
  }, [
    selectedProviderIds,
    selectedFinalityProviderIds,
    setSelectedFinalityProviderIds,
  ]);

  const handleAdd = (providerPk: string) => {
    if (selectedProviderIds.includes(providerPk)) {
      onClose();
      return;
    }

    // Add selected provider ID to list
    const updatedProviderIds = [...selectedProviderIds, providerPk];
    onChange(updatedProviderIds);

    // Update the selectedFinalityProviderIds Set to keep it in sync
    const newSelectedFinalityProviderIds = new Set(selectedFinalityProviderIds);
    newSelectedFinalityProviderIds.add(providerPk);
    setSelectedFinalityProviderIds(newSelectedFinalityProviderIds);

    onClose();
  };

  const handleRemove = (btcPk: string) => {
    const updatedProviderIds = selectedProviderIds.filter(
      (fpId) => fpId !== btcPk,
    );
    onChange(updatedProviderIds);

    // Update the selectedFinalityProviderIds Set to keep it in sync
    const newSelectedFinalityProviderIds = new Set(selectedFinalityProviderIds);
    newSelectedFinalityProviderIds.delete(btcPk);
    setSelectedFinalityProviderIds(newSelectedFinalityProviderIds);
  };

  return (
    <SubSection>
      <div className="flex flex-col w-full gap-4">
        <div className="flex flex-row">
          <div className="font-normal items-center flex flex-row justify-between w-full content-center">
            <span className="text-sm sm:text-base">
              Add BSN and Finality Provider
            </span>
            <CounterButton
              counter={selectedProviderIds.length}
              max={max}
              onAdd={onOpen}
              alwaysShowCounter={true}
            />
          </div>
        </div>
        {selectedProviderIds.length > 0 && (
          <SelectedProvidersList
            providerIds={selectedProviderIds}
            onRemove={handleRemove}
          />
        )}
      </div>
      {open && (
        <BsnModal
          open={open}
          onAdd={handleAdd}
          onClose={onClose}
          selectedProviderIds={selectedProviderIds}
        />
      )}
    </SubSection>
  );
}
