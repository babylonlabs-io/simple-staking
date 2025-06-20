import { useField } from "@babylonlabs-io/core-ui";
import { useMemo } from "react";
import { AiOutlinePlus } from "react-icons/ai";
import { twJoin } from "tailwind-merge";

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
          <div className="flex">
            {counter < max && (
              <div
                className={twJoin(
                  "w-10 h-10 flex items-center justify-center rounded-md bg-primary-highlight border border-accent-primary cursor-pointer",
                  counter > 0 ? "rounded-r-none" : "rounded",
                )}
                onClick={onOpen}
              >
                <AiOutlinePlus size={20} />
              </div>
            )}
            {0 < counter && 1 < max && (
              <div
                className={twJoin(
                  "px-4 h-10 flex items-center border border-accent-primary",
                  counter === max ? "rounded-md" : "border-l-0 rounded-r-md",
                  "cursor-pointer",
                )}
              >
                {counter}/{max}
              </div>
            )}
          </div>
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
