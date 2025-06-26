import { useField } from "@babylonlabs-io/core-ui";

import { CounterButton } from "@/ui/components/Multistaking/CounterButton";

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

  const handleAdd = (providerPk: string) => {
    // Add selected provider ID to list
    onChange([...selectedProviderIds, providerPk]);
    onClose();
  };

  const handleRemove = (btcPk: string) => {
    onChange(selectedProviderIds.filter((fpId) => fpId !== btcPk));
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
