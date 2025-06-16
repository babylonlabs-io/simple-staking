import { useField } from "@babylonlabs-io/core-ui";
import { useEffect, useState } from "react";

import { CounterButton } from "@/ui/components/Multistaking/CounterButton";
import type { FinalityProvider } from "@/ui/types/finalityProviders";

import { SubSection } from "../MultistakingForm/SubSection";

import { BsnModal } from "./BsnModal";
import { SelectedProvidersList } from "./SelectedProvidersList";

interface Props {
  open: boolean;
  max: number;
  disabled?: boolean;
  defaultValue?: string;
  onOpen: () => void;
  onClose: () => void;
}

export function BsnFinalityProviderField({
  disabled = false,
  max,
  defaultValue,
  open,
  onOpen,
  onClose,
}: Props) {
  const { onChange } = useField({
    name: "finalityProvider",
    defaultValue,
    disabled,
  });

  const [selectedProviders, setSelectedProviders] = useState<
    FinalityProvider[]
  >([]);

  useEffect(() => {
    if (selectedProviders.length > 0) {
      onChange(selectedProviders[0].btcPk);
    } else {
      onChange("");
    }
  }, [selectedProviders, onChange]);

  const handleAdd = () => {
    // TODO: Implement provider selection logic
    onClose();
  };

  const handleRemove = (btcPk: string) => {
    setSelectedProviders((prev) => prev.filter((fp) => fp.btcPk !== btcPk));
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
              counter={selectedProviders.length}
              max={max}
              onAdd={onOpen}
              alwaysShowCounter={true}
            />
          </div>
        </div>
        {selectedProviders.length > 0 && (
          <SelectedProvidersList
            providers={selectedProviders}
            onRemove={handleRemove}
          />
        )}
      </div>
      <BsnModal open={open} onAdd={handleAdd} onClose={onClose} />
    </SubSection>
  );
}
